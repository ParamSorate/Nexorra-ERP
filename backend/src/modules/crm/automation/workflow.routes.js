const express = require('express');
const router = express.Router();
const workflowController = require('./workflow.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

router.use(authenticate);

router.get('/', authorize('automation', 'READ'), workflowController.getWorkflows);
router.post('/', authorize('automation', 'CREATE'), workflowController.createWorkflow);
router.put('/:id/toggle', authorize('automation', 'UPDATE'), workflowController.toggleWorkflow);
router.delete('/:id', authorize('automation', 'DELETE'), workflowController.deleteWorkflow);
router.get('/executions', authorize('automation', 'READ'), workflowController.getWorkflowExecutions);

module.exports = router;
