const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

// Public Auth endpoint
router.post('/login', adminController.login);

// Guarded endpoints
router.use(authenticate);

router.get('/me', adminController.getMe);
router.post('/switch-role', adminController.switchRole);

// Users
router.get('/users', authorize('administration', 'READ'), adminController.getUsers);
router.post('/users', authorize('administration', 'CREATE'), adminController.createUser);
router.put('/users/:id', authorize('administration', 'UPDATE'), adminController.updateUser);

// Roles
router.get('/roles', authorize('administration', 'READ'), adminController.getRoles);
router.put('/roles/:id', authorize('administration', 'UPDATE'), adminController.updateRolePermissions);

// Audit Logs
router.get('/audit-logs', authorize('administration', 'READ'), adminController.getAuditLogs);

module.exports = router;
