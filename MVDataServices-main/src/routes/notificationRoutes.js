const express = require("express");
const {
  createNotification,
  getNotificationsByUser,
  markAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.post('/', createNotification);
router.get('/', getNotificationsByUser);
router.put('/mark-as-read', markAsRead);


module.exports = router;