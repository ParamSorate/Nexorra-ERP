const Notification = require('./notification.model');
const { successResponse } = require('../../../utils/response');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipientUserId: req.user.userId },
        { recipientUserId: 'ALL' }
      ]
    }).sort({ createdAt: -1 }).limit(30);

    const unreadCount = await Notification.countDocuments({
      $or: [
        { recipientUserId: req.user.userId },
        { recipientUserId: 'ALL' }
      ],
      isRead: false
    });

    return successResponse(res, 'Notifications loaded', { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany(
        { recipientUserId: req.user.userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return successResponse(res, 'All notifications marked as read', null);
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return successResponse(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
