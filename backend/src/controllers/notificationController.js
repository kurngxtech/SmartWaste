const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get all notifications for logged in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('[NotificationController.getNotifications] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching notifications' });
  }
};

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('[NotificationController.markAsRead] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error marking notification as read' });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
