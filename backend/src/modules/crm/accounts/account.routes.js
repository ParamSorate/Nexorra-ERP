const express = require('express');
const router = express.Router();
const accountController = require('./account.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

router.use(authenticate);

router.get('/', authorize('accounts', 'READ'), accountController.getAccounts);
router.post('/', authorize('accounts', 'CREATE'), accountController.createAccount);
router.get('/:id', authorize('accounts', 'READ'), accountController.getAccountById);
router.put('/:id', authorize('accounts', 'UPDATE'), accountController.updateAccount);
router.delete('/:id', authorize('accounts', 'DELETE'), accountController.deleteAccount);

module.exports = router;
