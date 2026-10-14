const express = require('express');
const router = express.Router();
const contactController = require('./contact.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

router.use(authenticate);

router.get('/', authorize('contacts', 'READ'), contactController.getContacts);
router.post('/', authorize('contacts', 'CREATE'), contactController.createContact);
router.get('/:id', authorize('contacts', 'READ'), contactController.getContactById);
router.put('/:id', authorize('contacts', 'UPDATE'), contactController.updateContact);
router.delete('/:id', authorize('contacts', 'DELETE'), contactController.deleteContact);

module.exports = router;
