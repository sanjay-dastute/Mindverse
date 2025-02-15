const userConnection = require('../config/conversation');
const Notification = userConnection.model('Notification');
const logger = require('../config/logger');

const createNotification = async (req, res) => {
  const { message, organizationId } = req.body;
  
  if (!message || !organizationId) {
    logger.warn('Attempt to create notification without message or organizationId');
    return res.status(400).json({ error: "Message and organizationId are required" });
  }

  const newNotification = new Notification({
    message,
    userId: organizationId,
  });

  try {
    logger.info(`Creating new notification for organizationId: ${organizationId}`);
    const savedNotification = await newNotification.save();
    logger.info(`Notification created successfully for organizationId: ${organizationId}`);
    res.status(201).json(savedNotification);
  } catch (error) {
    logger.error({ err: error }, `Error saving notification for organizationId: ${organizationId}`);
    res.status(500).json({ error: "Error saving notification" });
  }
};

const getNotificationsByUser = async (req, res) => {
  const { organizationId } = req.query;

  try {
    logger.info(`Fetching unread notifications for organizationId: ${organizationId}`);
    const notifications = await Notification.find({
      userId: organizationId,
      read: false,
    });
    logger.info(`Successfully fetched ${notifications.length} unread notifications for organizationId: ${organizationId}`);
    res.status(200).json(notifications);
  } catch (error) {
    logger.error({ err: error }, `Error fetching notifications for organizationId: ${organizationId}`);
    res.status(500).json({ error: "Error fetching notifications" });
  }
};

const markAsRead = async (req, res) => {
  const { notificationId } = req.body;

  try {
    logger.info(`Marking notification as read: ${notificationId}`);
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      logger.warn(`Notification not found: ${notificationId}`);
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    logger.info(`Notification marked as read successfully: ${notificationId}`);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    logger.error({ err: error }, `Error marking notification as read: ${notificationId}`);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markAsRead,
}