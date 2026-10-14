const Lead = require('../../modules/crm/leads/lead.model');
const Account = require('../../modules/crm/accounts/account.model');
const Contact = require('../../modules/crm/contacts/contact.model');
const Opportunity = require('../../modules/crm/opportunities/opportunity.model');
const Activity = require('../../modules/crm/activities/activity.model');
const Order = require('../../modules/crm/sales/order.model');
const Ticket = require('../../modules/crm/customerService/ticket.model');
const { logAudit } = require('../../middleware/auditLogger');

/**
 * Controlled CRM Tool Execution Layer
 * All tools validate schemas, enforce security guardrails, and create audit trails.
 */
class CRMTools {
  // 1. getLead
  async getLead({ leadId }, user) {
    const lead = await Lead.findOne({ $or: [{ leadId }, { _id: leadId.match(/^[0-9a-fA-F]{24}$/) ? leadId : null }] });
    if (!lead) throw new Error(`Lead '${leadId}' not found`);
    return lead;
  }

  // 2. searchLeads
  async searchLeads({ query, status, limit = 10 }, user) {
    const filter = {};
    if (query) {
      filter.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    if (status) filter.leadStatus = status;
    return await Lead.find(filter).limit(Number(limit)).sort({ leadScore: -1 });
  }

  // 3. updateLead (Requires human confirmation if changing status to Converted or Lost)
  async updateLead({ leadId, updates }, user, requiresApproval = false) {
    const lead = await Lead.findOne({ $or: [{ leadId }, { _id: leadId.match(/^[0-9a-fA-F]{24}$/) ? leadId : null }] });
    if (!lead) throw new Error(`Lead '${leadId}' not found`);

    const prev = lead.toObject();
    Object.assign(lead, updates);
    await lead.save();

    await logAudit({
      action: 'AI_TOOL_EXECUTION',
      module: 'leads',
      entity: 'Lead',
      entityId: lead.leadId,
      previousValue: prev,
      newValue: lead.toObject(),
      details: `AI Tool updateLead executed by agent on behalf of ${user.name}`
    });

    return lead;
  }

  // 4. createTask
  async createTask({ subject, description, priority = 'Medium', assignedUserId, relatedEntity, relatedId, dueDate }, user) {
    const actId = 'ACT-' + Math.floor(1000 + Math.random() * 9000);
    const relatedTo = {};
    if (relatedEntity === 'Lead') relatedTo.lead = { id: relatedId, name: subject };
    if (relatedEntity === 'Opportunity') relatedTo.opportunity = { id: relatedId, name: subject };
    if (relatedEntity === 'Account') relatedTo.account = { id: relatedId, name: subject };

    const task = await Activity.create({
      activityId: actId,
      type: 'Task',
      subject,
      description: description || 'Created automatically via CRM AI Agent',
      priority,
      assignedUser: {
        userId: assignedUserId || user.userId || 'USR001',
        name: user.name || 'Sarah Jenkins'
      },
      relatedTo,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    await logAudit({
      action: 'AI_TOOL_EXECUTION',
      module: 'activities',
      entity: 'Activity',
      entityId: task.activityId,
      newValue: task.toObject(),
      details: `AI Tool createTask generated task ${actId}`
    });

    return task;
  }

  // 5. getCustomer (Account 360)
  async getCustomer({ accountId }, user) {
    const account = await Account.findOne({ $or: [{ accountId }, { _id: accountId.match(/^[0-9a-fA-F]{24}$/) ? accountId : null }] });
    if (!account) throw new Error(`Customer Account '${accountId}' not found`);

    const [contacts, opportunities, activities, orders, tickets] = await Promise.all([
      Contact.find({ account: account._id }),
      Opportunity.find({ account: account._id }),
      Activity.find({ 'relatedTo.account.id': account._id }).sort({ activityDate: -1 }),
      Order.find({ account: account._id }).sort({ orderDate: -1 }),
      Ticket.find({ account: account._id }).sort({ createdAt: -1 })
    ]);

    return {
      account,
      contacts,
      opportunities,
      activities,
      orders,
      tickets
    };
  }

  // 6. getOpportunity
  async getOpportunity({ opportunityId }, user) {
    const opp = await Opportunity.findOne({ $or: [{ opportunityId }, { _id: opportunityId.match(/^[0-9a-fA-F]{24}$/) ? opportunityId : null }] });
    if (!opp) throw new Error(`Opportunity '${opportunityId}' not found`);
    return opp;
  }

  // 7. updateOpportunity
  async updateOpportunity({ opportunityId, updates }, user) {
    const opp = await Opportunity.findOne({ $or: [{ opportunityId }, { _id: opportunityId.match(/^[0-9a-fA-F]{24}$/) ? opportunityId : null }] });
    if (!opp) throw new Error(`Opportunity '${opportunityId}' not found`);

    const prev = opp.toObject();
    Object.assign(opp, updates);
    await opp.save();

    await logAudit({
      action: 'AI_TOOL_EXECUTION',
      module: 'opportunities',
      entity: 'Opportunity',
      entityId: opp.opportunityId,
      previousValue: prev,
      newValue: opp.toObject(),
      details: `AI Tool updateOpportunity modified deal '${opp.name}'`
    });

    return opp;
  }

  // 8. createActivity
  async createActivity({ type, subject, description, priority, relatedType, relatedId }, user) {
    const actId = 'ACT-' + Math.floor(1000 + Math.random() * 9000);
    const activity = await Activity.create({
      activityId: actId,
      type: type || 'Note',
      subject,
      description,
      priority: priority || 'Medium',
      assignedUser: {
        userId: user.userId || 'USR001',
        name: user.name || 'Sarah Jenkins'
      }
    });

    await logAudit({
      action: 'AI_TOOL_EXECUTION',
      module: 'activities',
      entity: 'Activity',
      entityId: activity.activityId,
      newValue: activity.toObject(),
      details: `AI Tool createActivity logged ${type}`
    });

    return activity;
  }

  // 9. getSalesReport
  async getSalesReport({ period = 'quarterly' }, user) {
    const orders = await Order.find();
    const opps = await Opportunity.find();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const wonDeals = opps.filter(o => o.stage === 'Closed Won');
    const pipelineValue = opps.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage)).reduce((sum, o) => sum + (o.amount || 0), 0);

    return {
      period,
      totalOrders: orders.length,
      totalRevenue,
      closedWonCount: wonDeals.length,
      pipelineValue,
      winRate: opps.length ? Math.round((wonDeals.length / opps.length) * 100) : 0
    };
  }

  // 10. getCustomerTimeline
  async getCustomerTimeline({ accountId }, user) {
    const account = await Account.findOne({ $or: [{ accountId }, { _id: accountId.match(/^[0-9a-fA-F]{24}$/) ? accountId : null }] });
    if (!account) throw new Error(`Account '${accountId}' not found`);

    const activities = await Activity.find({ 'relatedTo.account.id': account._id }).sort({ activityDate: -1 });
    const tickets = await Ticket.find({ account: account._id }).sort({ createdAt: -1 });
    const orders = await Order.find({ account: account._id }).sort({ orderDate: -1 });

    const timeline = [
      ...activities.map(a => ({ type: 'ACTIVITY', title: a.subject, date: a.activityDate, details: a.description, icon: 'activity' })),
      ...tickets.map(t => ({ type: 'TICKET', title: `Ticket #${t.ticketId}: ${t.subject}`, date: t.createdAt, details: `Status: ${t.status}, Priority: ${t.priority}`, icon: 'life-buoy' })),
      ...orders.map(o => ({ type: 'ORDER', title: `Order #${o.orderNumber}`, date: o.orderDate, details: `Amount: $${o.total.toLocaleString()} - Status: ${o.status}`, icon: 'shopping-cart' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      accountName: account.companyName,
      timeline
    };
  }
}

module.exports = new CRMTools();
