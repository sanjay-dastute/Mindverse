const userConnection = require('../config/conversation');
const conversationConnection = require('../config/conversation');
const logger = require('../utils/logger');

// Initialize models as null
let Notification = null;

// Initialize models after connection is ready
const initializeModels = async () => {
    try {
        // Wait for connection to be ready
        await new Promise(resolve => conversationConnection.on('connected', resolve));

        // Initialize models
        Notification = conversationConnection.model('Notification');
        logger.info('Notification model initialized successfully');
    } catch (error) {
        logger.error('Error initializing notification model:', error);
        setTimeout(initializeModels, 1000);
    }
};

// Initialize models
initializeModels();

const createNotification = async (req, res) => {
  const { message, organizationId } = req.body;
  
  if (!message || !organizationId) {
    logger.warn('Attempt to create notification without message or organizationId');
    return res.status(400).json({
      success: false,
      message: "Message and Organization ID are required. Please provide both values."
    });
  }

  const newNotification = new Notification({
    message,
    userId: organizationId,
  });

  try {
    logger.info(`Creating new notification for organizationId: ${organizationId}`);
    const savedNotification = await newNotification.save();
    logger.info(`Notification created successfully for organizationId: ${organizationId}`);
    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification: savedNotification
    });
  } catch (error) {
    logger.error({ err: error }, `Error saving notification for organizationId: ${organizationId}`);
    res.status(500).json({
      success: false,
      message: "Failed to save notification. Please try again."
    });
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
    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    logger.error({ err: error }, `Error fetching notifications for organizationId: ${organizationId}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications. Please try again."
    });
  }
};

const markAsRead = async (req, res) => {
  const { notificationId } = req.body;

  try {
    logger.info(`Marking notification as read: ${notificationId}`);
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      logger.warn(`Notification not found: ${notificationId}`);
      return res.status(404).json({
        success: false,
        message: "Notification not found. Please try again."
      });
    }

    notification.read = true;
    await notification.save();

    logger.info(`Notification marked as read successfully: ${notificationId}`);
    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully"
    });
  } catch (error) {
    logger.error({ err: error }, `Error marking notification as read: ${notificationId}`);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read. Please try again."
    });
  }
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markAsRead,
}
