const express = require('express');
const router = express.Router();
const serviceController = require('./service.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

router.use(authenticate);

// Tickets
router.get('/tickets', authorize('customerService', 'READ'), serviceController.getTickets);
router.post('/tickets', authorize('customerService', 'CREATE'), serviceController.createTicket);
router.put('/tickets/:id', authorize('customerService', 'UPDATE'), serviceController.updateTicket);

// Complaints
router.get('/complaints', authorize('customerService', 'READ'), serviceController.getComplaints);
router.post('/complaints', authorize('customerService', 'CREATE'), serviceController.createComplaint);

// SLA
router.get('/sla-rules', authorize('customerService', 'READ'), serviceController.getSlaRules);
router.put('/sla-rules/:id', authorize('customerService', 'UPDATE'), serviceController.updateSlaRule);

module.exports = router;
