const { Workflow, WorkflowExecution } = require('./workflow.model');
const { successResponse, errorResponse } = require('../../../utils/response');
const { logAudit } = require('../../../middleware/auditLogger');

const getWorkflows = async (req, res, next) => {
  try {
    const workflows = await Workflow.find().sort({ createdAt: -1 });
    return successResponse(res, 'Workflows retrieved successfully', workflows);
  } catch (error) {
    next(error);
  }
};

const createWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.create(req.body);
    await logAudit({ req, action: 'CREATE', module: 'automation', entity: 'Workflow', entityId: String(workflow._id), newValue: workflow.toObject() });
    return successResponse(res, 'Workflow created successfully', workflow, 201);
  } catch (error) {
    next(error);
  }
};

const toggleWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return errorResponse(res, 'Workflow not found', 404);

    workflow.isActive = !workflow.isActive;
    await workflow.save();

    await logAudit({ req, action: 'UPDATE', module: 'automation', entity: 'Workflow', entityId: String(workflow._id), details: `Workflow '${workflow.name}' active state changed to ${workflow.isActive}` });
    return successResponse(res, `Workflow ${workflow.isActive ? 'activated' : 'deactivated'}`, workflow);
  } catch (error) {
    next(error);
  }
};

const deleteWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) return errorResponse(res, 'Workflow not found', 404);

    await logAudit({ req, action: 'DELETE', module: 'automation', entity: 'Workflow', entityId: String(workflow._id), details: `Deleted workflow '${workflow.name}'` });
    return successResponse(res, 'Workflow deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getWorkflowExecutions = async (req, res, next) => {
  try {
    const executions = await WorkflowExecution.find().sort({ executedAt: -1 }).limit(50);
    return successResponse(res, 'Workflow execution logs retrieved', executions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkflows,
  createWorkflow,
  toggleWorkflow,
  deleteWorkflow,
  getWorkflowExecutions
};
