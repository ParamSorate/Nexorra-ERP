const express = require('express');
const router = express.Router();
const marketingController = require('./marketing.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

router.use(authenticate);

router.get('/campaigns', authorize('marketing', 'READ'), marketingController.getCampaigns);
router.post('/campaigns', authorize('marketing', 'CREATE'), marketingController.createCampaign);
router.put('/campaigns/:id', authorize('marketing', 'UPDATE'), marketingController.updateCampaign);
router.get('/lead-sources', authorize('marketing', 'READ'), marketingController.getLeadSourcePerformance);

module.exports = router;
