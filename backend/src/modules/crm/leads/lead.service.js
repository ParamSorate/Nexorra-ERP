const Lead = require('./lead.model');
const Account = require('../accounts/account.model');
const Contact = require('../contacts/contact.model');
const Opportunity = require('../opportunities/opportunity.model');
const { calculateLeadScore, getScoringRules, updateScoringRules } = require('../../../utils/scoringEngine');
const workflowEngine = require('../automation/workflow.engine');
const { logAudit } = require('../../../middleware/auditLogger');
const Notification = require('../notifications/notification.model');

class LeadService {
  async getLeads({ page = 1, limit = 10, search = '', status = '', owner = '', source = '', sortBy = 'createdAt', sortOrder = -1 }) {
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { leadId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.leadStatus = status;
    if (owner) query['owner.userId'] = owner;
    if (source) query.leadSource = source;

    const skip = (Number(page) - 1) * Number(limit);
    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ [sortBy]: Number(sortOrder) }).skip(skip).limit(Number(limit)),
      Lead.countDocuments(query)
    ]);

    return {
      leads,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getLeadById(id) {
    const lead = await Lead.findOne({ $or: [{ leadId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!lead) throw new Error('Lead not found');
    return lead;
  }

  async createLead(leadData, user, req) {
    // Generate unique Lead ID if not provided
    if (!leadData.leadId) {
      const count = await Lead.countDocuments();
      leadData.leadId = `LED-${1000 + count + 1}`;
    }

    // Set owner if not present
    if (!leadData.owner || !leadData.owner.userId) {
      leadData.owner = {
        userId: user.userId || 'USR001',
        name: user.name || 'Sarah Jenkins',
        email: user.email || 'sarah.jenkins@crm.internal'
      };
    }

    // Dynamic scoring
    const { score, category } = calculateLeadScore(leadData);
    leadData.leadScore = score;
    leadData.scoreCategory = category;

    const lead = await Lead.create(leadData);

    // Audit log
    await logAudit({
      req,
      action: 'CREATE',
      module: 'leads',
      entity: 'Lead',
      entityId: lead.leadId,
      newValue: lead.toObject(),
      details: `Created new lead ${lead.leadId} for ${lead.company}`
    });

    // Notify assigned owner if different from creator
    if (lead.owner.userId !== user.userId) {
      await Notification.create({
        recipientUserId: lead.owner.userId,
        title: 'New Lead Assignment',
        message: `You have been assigned new lead ${lead.firstName} ${lead.lastName} (${lead.company})`,
        type: 'lead_assignment',
        entityType: 'Lead',
        entityId: lead.leadId
      });
    }

    // Trigger workflow engine
    await workflowEngine.evaluateAndExecute('LEAD_CREATED', 'Lead', lead.toObject());
    if (score >= 70) {
      await workflowEngine.evaluateAndExecute('LEAD_SCORE_CHANGED', 'Lead', lead.toObject());
    }

    return lead;
  }

  async updateLead(id, updates, user, req) {
    const lead = await this.getLeadById(id);
    const prev = lead.toObject();

    // Recalculate score if relevant fields changed
    const merged = { ...prev, ...updates };
    const { score, category } = calculateLeadScore(merged);
    updates.leadScore = score;
    updates.scoreCategory = category;

    Object.assign(lead, updates);
    await lead.save();

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'leads',
      entity: 'Lead',
      entityId: lead.leadId,
      previousValue: prev,
      newValue: lead.toObject(),
      details: `Updated lead ${lead.leadId}`
    });

    if (updates.leadStatus && updates.leadStatus !== prev.leadStatus) {
      await workflowEngine.evaluateAndExecute('LEAD_SCORE_CHANGED', 'Lead', lead.toObject());
    }

    return lead;
  }

  async deleteLead(id, user, req) {
    const lead = await this.getLeadById(id);
    const prev = lead.toObject();
    await Lead.findByIdAndDelete(lead._id);

    await logAudit({
      req,
      action: 'DELETE',
      module: 'leads',
      entity: 'Lead',
      entityId: lead.leadId,
      previousValue: prev,
      details: `Deleted lead ${lead.leadId}`
    });

    return { message: `Lead ${lead.leadId} deleted successfully` };
  }

  /**
   * Section 4: Lead Conversion
   * Creates Account, Contact, and Opportunity, maintains bidirectional links
   */
  async convertLead(id, conversionPayload = {}, user, req) {
    const lead = await this.getLeadById(id);
    if (lead.isConverted) {
      throw new Error(`Lead ${lead.leadId} has already been converted.`);
    }

    // 1. Create Account
    const accCount = await Account.countDocuments();
    const newAccount = await Account.create({
      accountId: `ACC-${1000 + accCount + 1}`,
      companyName: conversionPayload.companyName || lead.company,
      industry: lead.industry || 'Technology',
      website: lead.website || '',
      phone: lead.phone || '',
      email: lead.email || '',
      address: {
        city: lead.location?.city || '',
        state: lead.location?.state || '',
        country: lead.location?.country || 'India'
      },
      accountOwner: lead.owner,
      customerType: 'Enterprise',
      customerStatus: 'Active',
      healthScore: 90,
      originalLeadId: lead._id
    });

    // 2. Create Contact
    const conCount = await Contact.countDocuments();
    const newContact = await Contact.create({
      contactId: `CON-${1000 + conCount + 1}`,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      jobTitle: lead.jobTitle || 'Executive Contact',
      account: newAccount._id,
      accountName: newAccount.companyName,
      isDecisionMaker: lead.qualification?.decisionMaker ?? true,
      contactOwner: lead.owner,
      originalLeadId: lead._id
    });

    // 3. Create Opportunity
    const oppCount = await Opportunity.countDocuments();
    const dealAmount = conversionPayload.opportunityAmount || 500000;
    const newOpportunity = await Opportunity.create({
      opportunityId: `OPP-${1000 + oppCount + 1}`,
      name: conversionPayload.opportunityName || `${newAccount.companyName} - Enterprise Expansion`,
      account: newAccount._id,
      accountName: newAccount.companyName,
      primaryContact: newContact._id,
      contactName: `${newContact.firstName} ${newContact.lastName}`,
      owner: lead.owner,
      stage: 'Qualification',
      amount: dealAmount,
      probability: 25,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      product: lead.qualification?.productInterest || 'Enterprise ERP Suite',
      source: lead.leadSource,
      originalLeadId: lead._id,
      stageHistory: [{
        fromStage: 'Lead Converted',
        toStage: 'Qualification',
        movedBy: user.name,
        movedAt: new Date(),
        reason: 'Converted from Lead'
      }]
    });

    // 4. Update Lead Record
    lead.isConverted = true;
    lead.leadStatus = 'Converted';
    lead.convertedAccountId = newAccount._id;
    lead.convertedContactId = newContact._id;
    lead.convertedOpportunityId = newOpportunity._id;
    lead.convertedAt = new Date();
    await lead.save();

    await logAudit({
      req,
      action: 'CONVERT',
      module: 'leads',
      entity: 'Lead',
      entityId: lead.leadId,
      details: `Lead ${lead.leadId} converted into Account ${newAccount.accountId}, Contact ${newContact.contactId}, and Opportunity ${newOpportunity.opportunityId}`
    });

    await Notification.create({
      recipientUserId: lead.owner.userId,
      title: 'Lead Converted Successfully',
      message: `${lead.firstName} ${lead.lastName} (${lead.company}) converted into Opportunity ${newOpportunity.name}`,
      type: 'deal_stage',
      entityType: 'Opportunity',
      entityId: newOpportunity.opportunityId
    });

    return {
      lead,
      account: newAccount,
      contact: newContact,
      opportunity: newOpportunity
    };
  }

  async importLeads(leadList, user, req) {
    const created = [];
    for (const item of leadList) {
      const lead = await this.createLead(item, user, req);
      created.push(lead);
    }
    return created;
  }
}

module.exports = new LeadService();
