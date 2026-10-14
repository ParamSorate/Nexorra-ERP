const express = require('express');
const router = express.Router();
const activityController = require('./activity.controller');
const { authenticate } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/rbac');

router.use(authenticate);

router.get('/', authorize('activities', 'READ'), activityController.getActivities);
router.post('/', authorize('activities', 'CREATE'), activityController.createActivity);
router.put('/:id', authorize('activities', 'UPDATE'), activityController.updateActivity);
router.delete('/:id', authorize('activities', 'DELETE'), activityController.deleteActivity);

module.exports = router;
