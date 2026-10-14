const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(authenticate);

router.post('/query', authorize('aiAgentCenter', 'READ'), aiController.queryAgent);
router.post('/tools', authorize('aiAgentCenter', 'CREATE'), aiController.executeTool);
router.get('/tasks', authorize('aiAgentCenter', 'READ'), aiController.getAiTasks);
router.post('/tasks/:id/approve', authorize('aiAgentCenter', 'APPROVE'), aiController.approveTask);
router.post('/tasks/:id/reject', authorize('aiAgentCenter', 'APPROVE'), aiController.rejectTask);

module.exports = router;
