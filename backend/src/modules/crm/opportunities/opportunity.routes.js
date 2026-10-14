const express = require('express');
const router = express.Router();
const opportunityController = require('./opportunity.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

router.use(authenticate);

router.get('/', authorize('opportunities', 'READ'), opportunityController.getOpportunities);
router.get('/pipeline-board', authorize('opportunities', 'READ'), opportunityController.getPipelineBoard);
router.get('/forecast', authorize('opportunities', 'READ'), opportunityController.getForecast);
router.post('/', authorize('opportunities', 'CREATE'), opportunityController.createOpportunity);

router.get('/:id', authorize('opportunities', 'READ'), opportunityController.getOpportunityById);
router.put('/:id', authorize('opportunities', 'UPDATE'), opportunityController.updateOpportunity);
router.put('/:id/stage', authorize('opportunities', 'UPDATE'), opportunityController.updateStage);
router.delete('/:id', authorize('opportunities', 'DELETE'), opportunityController.deleteOpportunity);

module.exports = router;
