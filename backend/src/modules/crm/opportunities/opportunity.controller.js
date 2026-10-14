const opportunityService = require('./opportunity.service');
const { successResponse } = require('../../../utils/response');

const getOpportunities = async (req, res, next) => {
  try {
    const result = await opportunityService.getOpportunities(req.query);
    return successResponse(res, 'Opportunities retrieved successfully', result.opportunities, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getPipelineBoard = async (req, res, next) => {
  try {
    const board = await opportunityService.getPipelineBoard();
    return successResponse(res, 'Pipeline Kanban board retrieved', board);
  } catch (error) {
    next(error);
  }
};

const getForecast = async (req, res, next) => {
  try {
    const forecast = await opportunityService.getForecast();
    return successResponse(res, 'Sales forecast calculated successfully', forecast);
  } catch (error) {
    next(error);
  }
};

const getOpportunityById = async (req, res, next) => {
  try {
    const opp = await opportunityService.getOpportunityById(req.params.id);
    return successResponse(res, 'Opportunity retrieved successfully', opp);
  } catch (error) {
    next(error);
  }
};

const createOpportunity = async (req, res, next) => {
  try {
    const opp = await opportunityService.createOpportunity(req.body, req.user, req);
    return successResponse(res, 'Opportunity created successfully', opp, 201);
  } catch (error) {
    next(error);
  }
};

const updateOpportunity = async (req, res, next) => {
  try {
    const opp = await opportunityService.updateOpportunity(req.params.id, req.body, req.user, req);
    return successResponse(res, 'Opportunity updated successfully', opp);
  } catch (error) {
    next(error);
  }
};

const updateStage = async (req, res, next) => {
  try {
    const { stage, reason, ...additional } = req.body;
    const opp = await opportunityService.changeStage(req.params.id, stage, reason, req.user, req, additional);
    return successResponse(res, `Deal stage moved to ${stage} successfully`, opp);
  } catch (error) {
    next(error);
  }
};

const deleteOpportunity = async (req, res, next) => {
  try {
    const result = await opportunityService.deleteOpportunity(req.params.id, req.user, req);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOpportunities,
  getPipelineBoard,
  getForecast,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  updateStage,
  deleteOpportunity
};
