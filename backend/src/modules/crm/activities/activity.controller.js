const activityService = require('./activity.service');
const { successResponse } = require('../../../utils/response');

const getActivities = async (req, res, next) => {
  try {
    const result = await activityService.getActivities(req.query);
    return successResponse(res, 'Activities retrieved successfully', result.activities, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

const createActivity = async (req, res, next) => {
  try {
    const activity = await activityService.createActivity(req.body, req.user, req);
    return successResponse(res, 'Activity recorded successfully', activity, 201);
  } catch (error) {
    next(error);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const activity = await activityService.updateActivity(req.params.id, req.body, req.user, req);
    return successResponse(res, 'Activity updated successfully', activity);
  } catch (error) {
    next(error);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const result = await activityService.deleteActivity(req.params.id, req.user, req);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
};
