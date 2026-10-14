const Campaign = require('./campaign.model');
const Lead = require('../leads/lead.model');
const { successResponse, errorResponse } = require('../../../utils/response');
const { logAudit } = require('../../../middleware/auditLogger');

const getCampaigns = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });
    return successResponse(res, 'Campaigns retrieved successfully', campaigns);
  } catch (error) {
    next(error);
  }
};

const createCampaign = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.campaignId) {
      const count = await Campaign.countDocuments();
      data.campaignId = `CMP-${1000 + count + 1}`;
    }
    data.owner = { userId: req.user.userId, name: req.user.name };
    const campaign = await Campaign.create(data);
    await logAudit({ req, action: 'CREATE', module: 'marketing', entity: 'Campaign', entityId: campaign.campaignId, newValue: campaign.toObject() });
    return successResponse(res, 'Campaign created successfully', campaign, 201);
  } catch (error) {
    next(error);
  }
};

const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!campaign) return errorResponse(res, 'Campaign not found', 404);
    await logAudit({ req, action: 'UPDATE', module: 'marketing', entity: 'Campaign', entityId: campaign.campaignId, newValue: campaign.toObject() });
    return successResponse(res, 'Campaign updated successfully', campaign);
  } catch (error) {
    next(error);
  }
};

const getLeadSourcePerformance = async (req, res, next) => {
  try {
    const leads = await Lead.find();
    const sourceMap = {};

    leads.forEach(l => {
      const src = l.leadSource || 'Other';
      if (!sourceMap[src]) {
        sourceMap[src] = { source: src, totalLeads: 0, convertedLeads: 0, avgScore: 0, totalScore: 0 };
      }
      sourceMap[src].totalLeads += 1;
      sourceMap[src].totalScore += (l.leadScore || 0);
      if (l.isConverted || l.leadStatus === 'Converted') {
        sourceMap[src].convertedLeads += 1;
      }
    });

    const performance = Object.values(sourceMap).map(item => ({
      source: item.source,
      totalLeads: item.totalLeads,
      convertedLeads: item.convertedLeads,
      conversionRate: item.totalLeads ? Math.round((item.convertedLeads / item.totalLeads) * 100) : 0,
      avgScore: item.totalLeads ? Math.round(item.totalScore / item.totalLeads) : 0
    })).sort((a, b) => b.totalLeads - a.totalLeads);

    return successResponse(res, 'Lead sources performance calculated', performance);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  updateCampaign,
  getLeadSourcePerformance
};
