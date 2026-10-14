const aiOrchestrator = require('./orchestrator/aiOrchestrator');
const AiTask = require('./aiTask.model');
const { successResponse, errorResponse } = require('../utils/response');

const queryAgent = async (req, res, next) => {
  try {
    const { agentType, query, payload } = req.body;
    const result = await aiOrchestrator.handleQuery({ agentType, query, payload }, req.user);
    return successResponse(res, `${agentType || 'AI Agent'} completed request successfully`, result);
  } catch (error) {
    next(error);
  }
};

const executeTool = async (req, res, next) => {
  try {
    const { toolName, params, confirmedByHuman } = req.body;
    const result = await aiOrchestrator.executeTool({ toolName, params, confirmedByHuman }, req.user);
    return successResponse(res, 'Tool operation processed', result);
  } catch (error) {
    next(error);
  }
};

const getAiTasks = async (req, res, next) => {
  try {
    const tasks = await AiTask.find().sort({ createdAt: -1 }).limit(50);
    return successResponse(res, 'Fetched AI agent execution history', tasks);
  } catch (error) {
    next(error);
  }
};

const approveTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await aiOrchestrator.approveAiTask(id, req.user);
    return successResponse(res, 'AI Task successfully approved and executed', result);
  } catch (error) {
    next(error);
  }
};

const rejectTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await AiTask.findById(id);
    if (!task) return errorResponse(res, 'AI task not found', 404);
    task.status = 'Rejected';
    await task.save();
    return successResponse(res, 'AI Task rejected', task);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  queryAgent,
  executeTool,
  getAiTasks,
  approveTask,
  rejectTask
};
