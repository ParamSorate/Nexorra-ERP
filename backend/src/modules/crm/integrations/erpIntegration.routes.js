const express = require('express');
const router = express.Router();
const erpController = require('./erpIntegration.controller');
const { authenticate } = require('../../../middleware/auth');

router.use(authenticate);

router.get('/status', erpController.getErpIntegrationsStatus);
router.post('/sync-order', erpController.syncOrderToErp);

module.exports = router;
