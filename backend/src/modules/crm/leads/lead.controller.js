const leadService = require('./lead.service');
const { getScoringRules, updateScoringRules } = require('../../../utils/scoringEngine');
const { successResponse, errorResponse } = require('../../../utils/response');

const getLeads = async (req, res, next) => {
  try {
    const result = await leadService.getLeads(req.query);
    return successResponse(res, 'Leads retrieved successfully', result.leads, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);
    return successResponse(res, 'Lead retrieved successfully', lead);
  } catch (error) {
    next(error);
  }
};

const createLead = async (req, res, next) => {
  try {
    const lead = await leadService.createLead(req.body, req.user, req);
    return successResponse(res, 'Lead created successfully', lead, 201);
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead(req.params.id, req.body, req.user, req);
    return successResponse(res, 'Lead updated successfully', lead);
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const result = await leadService.deleteLead(req.params.id, req.user, req);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

const convertLead = async (req, res, next) => {
  try {
    const result = await leadService.convertLead(req.params.id, req.body, req.user, req);
    return successResponse(res, 'Lead converted into Account, Contact, and Opportunity successfully', result);
  } catch (error) {
    next(error);
  }
};

const importLeads = async (req, res, next) => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads) || leads.length === 0) {
      return errorResponse(res, 'Invalid lead payload. Array of leads expected.', 400);
    }
    const result = await leadService.importLeads(leads, req.user, req);
    return successResponse(res, `Successfully imported ${result.length} leads`, result, 201);
  } catch (error) {
    next(error);
  }
};

const getScoringConfig = async (req, res) => {
  const rules = getScoringRules();
  return successResponse(res, 'Active scoring rules retrieved', rules);
};

const updateScoringConfig = async (req, res) => {
  const updated = updateScoringRules(req.body);
  return successResponse(res, 'Lead scoring rules updated successfully', updated);
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  importLeads,
  getScoringConfig,
  updateScoringConfig
};
