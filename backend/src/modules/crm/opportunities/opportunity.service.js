const Opportunity = require('./opportunity.model');
const Activity = require('../activities/activity.model');
const Notification = require('../notifications/notification.model');
const workflowEngine = require('../automation/workflow.engine');
const { logAudit } = require('../../../middleware/auditLogger');

const STAGE_PROBABILITIES = {
  'New': 10,
  'Qualification': 20,
  'Discovery': 40,
  'Proposal': 60,
  'Negotiation': 80,
  'Closed Won': 100,
  'Closed Lost': 0
};

class OpportunityService {
  async getOpportunities({ page = 1, limit = 20, search = '', stage = '', owner = '', pipeline = '', sortBy = 'createdAt', sortOrder = -1 }) {
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { accountName: { $regex: search, $options: 'i' } },
        { opportunityId: { $regex: search, $options: 'i' } }
      ];
    }
    if (stage) query.stage = stage;
    if (owner) query['owner.userId'] = owner;
    if (pipeline) query.pipeline = pipeline;

    const skip = (Number(page) - 1) * Number(limit);
    const [opportunities, total] = await Promise.all([
      Opportunity.find(query).sort({ [sortBy]: Number(sortOrder) }).skip(skip).limit(Number(limit)),
      Opportunity.countDocuments(query)
    ]);

    return {
      opportunities,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getPipelineBoard() {
    const opps = await Opportunity.find().sort({ updatedAt: -1 });
    const stages = ['New', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

    const board = {};
    stages.forEach(s => {
      board[s] = {
        stage: s,
        deals: [],
        totalValue: 0,
        weightedValue: 0
      };
    });

    opps.forEach(deal => {
      const dealObj = deal.toObject();
      if (board[deal.stage]) {
        board[deal.stage].deals.push(dealObj);
        board[deal.stage].totalValue += (deal.amount || 0);
        board[deal.stage].weightedValue += (dealObj.weightedAmount || ((deal.amount * deal.probability) / 100));
      }
    });

    return Object.values(board);
  }

  async getOpportunityById(id) {
    const opp = await Opportunity.findOne({ $or: [{ opportunityId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!opp) throw new Error('Opportunity not found');
    return opp;
  }

  async createOpportunity(data, user, req) {
    if (!data.opportunityId) {
      const count = await Opportunity.countDocuments();
      data.opportunityId = `OPP-${1000 + count + 1}`;
    }

    if (!data.owner || !data.owner.userId) {
      data.owner = {
        userId: user.userId || 'USR001',
        name: user.name || 'Sarah Jenkins'
      };
    }

    if (STAGE_PROBABILITIES[data.stage] !== undefined) {
      data.probability = STAGE_PROBABILITIES[data.stage];
    }

    data.stageHistory = [{
      fromStage: 'Creation',
      toStage: data.stage || 'New',
      movedBy: user.name,
      movedAt: new Date(),
      reason: 'Initial creation'
    }];

    const opp = await Opportunity.create(data);

    await logAudit({
      req,
      action: 'CREATE',
      module: 'opportunities',
      entity: 'Opportunity',
      entityId: opp.opportunityId,
      newValue: opp.toObject(),
      details: `Created opportunity ${opp.name} (₹${opp.amount.toLocaleString()})`
    });

    await workflowEngine.evaluateAndExecute('OPPORTUNITY_STAGE_CHANGED', 'Opportunity', opp.toObject());
    if (opp.amount > 500000) {
      await workflowEngine.evaluateAndExecute('OPPORTUNITY_AMOUNT_HIGH', 'Opportunity', opp.toObject());
    }

    return opp;
  }

  async updateOpportunity(id, updates, user, req) {
    const opp = await this.getOpportunityById(id);
    const prev = opp.toObject();

    if (updates.stage && updates.stage !== opp.stage) {
      return await this.changeStage(id, updates.stage, updates.reason || 'Stage progression', user, req, updates);
    }

    Object.assign(opp, updates);
    await opp.save();

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'opportunities',
      entity: 'Opportunity',
      entityId: opp.opportunityId,
      previousValue: prev,
      newValue: opp.toObject(),
      details: `Updated opportunity ${opp.name}`
    });

    return opp;
  }

  async changeStage(id, newStage, reason = 'Stage updated', user, req, additionalUpdates = {}) {
    const opp = await this.getOpportunityById(id);
    const prevStage = opp.stage;
    const prev = opp.toObject();

    opp.stage = newStage;
    if (STAGE_PROBABILITIES[newStage] !== undefined) {
      opp.probability = STAGE_PROBABILITIES[newStage];
    }
    Object.assign(opp, additionalUpdates);

    opp.stageHistory.push({
      fromStage: prevStage,
      toStage: newStage,
      movedBy: user.name,
      movedAt: new Date(),
      reason
    });

    await opp.save();

    // 1. Audit Log
    await logAudit({
      req,
      action: 'STAGE_CHANGE',
      module: 'opportunities',
      entity: 'Opportunity',
      entityId: opp.opportunityId,
      previousValue: { stage: prevStage, amount: opp.amount },
      newValue: { stage: newStage, amount: opp.amount },
      details: `Stage changed from ${prevStage} -> ${newStage}. Reason: ${reason}`
    });

    // 2. Automated Activity Record
    const actId = 'ACT-' + Math.floor(1000 + Math.random() * 9000);
    await Activity.create({
      activityId: actId,
      type: 'Follow-up',
      subject: `Stage Progression: Moved to ${newStage}`,
      description: `Deal moved from ${prevStage} to ${newStage} by ${user.name}. Reason: ${reason}`,
      priority: newStage === 'Closed Won' ? 'High' : 'Medium',
      assignedUser: opp.owner,
      relatedTo: {
        opportunity: { id: opp._id, name: opp.name },
        account: { id: opp.account, name: opp.accountName }
      },
      status: 'Completed',
      completedAt: new Date()
    });

    // 3. Notification
    await Notification.create({
      recipientUserId: opp.owner.userId,
      title: `Deal Stage Changed: ${opp.name}`,
      message: `Moved to ${newStage} stage (Value: ₹${opp.amount.toLocaleString()})`,
      type: 'deal_stage',
      entityType: 'Opportunity',
      entityId: opp.opportunityId
    });

    // 4. Trigger Workflow Engine
    await workflowEngine.evaluateAndExecute('OPPORTUNITY_STAGE_CHANGED', 'Opportunity', opp.toObject());

    return opp;
  }

  async deleteOpportunity(id, user, req) {
    const opp = await this.getOpportunityById(id);
    const prev = opp.toObject();
    await Opportunity.findByIdAndDelete(opp._id);

    await logAudit({
      req,
      action: 'DELETE',
      module: 'opportunities',
      entity: 'Opportunity',
      entityId: opp.opportunityId,
      previousValue: prev,
      details: `Deleted opportunity ${opp.name}`
    });

    return { message: `Opportunity ${opp.opportunityId} deleted successfully` };
  }

  /**
   * Section 7 Forecast calculations
   */
  async getForecast() {
    const opps = await Opportunity.find();

    const wonOpps = opps.filter(o => o.stage === 'Closed Won');
    const lostOpps = opps.filter(o => o.stage === 'Closed Lost');
    const openOpps = opps.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage));

    const totalPipeline = openOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
    const weightedPipeline = Math.round(openOpps.reduce((sum, o) => sum + ((o.amount * o.probability) / 100), 0));
    const wonRevenue = wonOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
    const lostRevenue = lostOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
    const expectedRevenue = wonRevenue + weightedPipeline;

    // Forecast by salesperson
    const repMap = {};
    opps.forEach(o => {
      const rep = o.owner?.name || 'Unassigned';
      if (!repMap[rep]) {
        repMap[rep] = { rep, totalDeals: 0, openPipeline: 0, wonRevenue: 0, weightedForecast: 0 };
      }
      repMap[rep].totalDeals += 1;
      if (o.stage === 'Closed Won') {
        repMap[rep].wonRevenue += o.amount;
      } else if (o.stage !== 'Closed Lost') {
        repMap[rep].openPipeline += o.amount;
        repMap[rep].weightedForecast += Math.round((o.amount * o.probability) / 100);
      }
    });

    // Forecast by month (next 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyForecast = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const mLabel = `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
      
      const inMonth = openOpps.filter(o => {
        const d = new Date(o.expectedCloseDate);
        return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
      });

      const mTotal = inMonth.reduce((s, o) => s + (o.amount || 0), 0);
      const mWeighted = Math.round(inMonth.reduce((s, o) => s + ((o.amount * o.probability) / 100), 0));

      monthlyForecast.push({
        month: mLabel,
        dealsCount: inMonth.length,
        totalPipeline: mTotal,
        weightedForecast: mWeighted
      });
    }

    return {
      kpis: {
        totalPipeline,
        weightedPipeline,
        expectedRevenue,
        wonRevenue,
        lostRevenue,
        totalOpportunities: opps.length,
        activeOpportunities: openOpps.length,
        winRate: opps.length ? Math.round((wonOpps.length / opps.length) * 100) : 0
      },
      forecastBySalesperson: Object.values(repMap),
      forecastByMonth: monthlyForecast
    };
  }
}

module.exports = new OpportunityService();
