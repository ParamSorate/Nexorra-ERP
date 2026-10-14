const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

router.use(authenticate);

router.get('/', authorize('reports', 'READ'), reportsController.getReportData);

module.exports = router;
