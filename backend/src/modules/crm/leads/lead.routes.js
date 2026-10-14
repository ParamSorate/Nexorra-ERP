const express = require('express');
const router = express.Router();
const leadController = require('./lead.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

router.use(authenticate);

router.get('/', authorize('leads', 'READ'), leadController.getLeads);
router.post('/', authorize('leads', 'CREATE'), leadController.createLead);
router.post('/import', authorize('leads', 'CREATE'), leadController.importLeads);
router.get('/scoring-rules', authorize('leads', 'READ'), leadController.getScoringConfig);
router.put('/scoring-rules', authorize('leads', 'UPDATE'), leadController.updateScoringConfig);

router.get('/:id', authorize('leads', 'READ'), leadController.getLeadById);
router.put('/:id', authorize('leads', 'UPDATE'), leadController.updateLead);
router.delete('/:id', authorize('leads', 'DELETE'), leadController.deleteLead);
router.post('/:id/convert', authorize('leads', 'UPDATE'), leadController.convertLead);

module.exports = router;
