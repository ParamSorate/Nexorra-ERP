const Activity = require('./activity.model');
const { logAudit } = require('../../../middleware/auditLogger');
const Notification = require('../notifications/notification.model');

class ActivityService {
  async getActivities({ page = 1, limit = 20, type = '', status = '', priority = '', assignedUser = '', entityId = '' }) {
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedUser) query['assignedUser.userId'] = assignedUser;

    if (entityId) {
      query.$or = [
        { 'relatedTo.lead.id': entityId },
        { 'relatedTo.opportunity.id': entityId },
        { 'relatedTo.account.id': entityId },
        { 'relatedTo.contact.id': entityId }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [activities, total] = await Promise.all([
      Activity.find(query).sort({ activityDate: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Activity.countDocuments(query)
    ]);

    return {
      activities,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async createActivity(data, user, req) {
    if (!data.activityId) {
      const count = await Activity.countDocuments();
      data.activityId = `ACT-${1000 + count + 1}`;
    }

    if (!data.assignedUser || !data.assignedUser.userId) {
      data.assignedUser = {
        userId: user.userId || 'USR001',
        name: user.name || 'Sarah Jenkins'
      };
    }

    const activity = await Activity.create(data);

    await logAudit({
      req,
      action: 'CREATE',
      module: 'activities',
      entity: 'Activity',
      entityId: activity.activityId,
      newValue: activity.toObject(),
      details: `Created activity [${activity.type}] - ${activity.subject}`
    });

    if (activity.type === 'Task' && activity.assignedUser.userId !== user.userId) {
      await Notification.create({
        recipientUserId: activity.assignedUser.userId,
        title: 'New Task Assigned',
        message: `Task assigned: ${activity.subject} (Due: ${new Date(activity.dueDate).toLocaleDateString()})`,
        type: 'task_overdue',
        entityType: 'Activity',
        entityId: activity.activityId
      });
    }

    return activity;
  }

  async updateActivity(id, updates, user, req) {
    const activity = await Activity.findOne({ $or: [{ activityId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!activity) throw new Error('Activity not found');

    const prev = activity.toObject();
    if (updates.status === 'Completed' && activity.status !== 'Completed') {
      updates.completedAt = new Date();
    }

    Object.assign(activity, updates);
    await activity.save();

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'activities',
      entity: 'Activity',
      entityId: activity.activityId,
      previousValue: prev,
      newValue: activity.toObject(),
      details: `Updated activity ${activity.activityId}`
    });

    return activity;
  }

  async deleteActivity(id, user, req) {
    const activity = await Activity.findOne({ $or: [{ activityId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!activity) throw new Error('Activity not found');

    const prev = activity.toObject();
    await Activity.findByIdAndDelete(activity._id);

    await logAudit({
      req,
      action: 'DELETE',
      module: 'activities',
      entity: 'Activity',
      entityId: activity.activityId,
      previousValue: prev,
      details: `Deleted activity ${activity.activityId}`
    });

    return { message: `Activity ${activity.activityId} deleted successfully` };
  }
}

module.exports = new ActivityService();
