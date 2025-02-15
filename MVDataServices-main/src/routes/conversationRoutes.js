// routes/conversationRoutes.js

const express = require("express");
const {
  getConversation,
  updateConversation,
  createConversation,
  markMessageAsDeleted,
  getConversations,
  getConversationsByMediaId,
  getMessageCountForOrganizationByDateRange,
  getUserCountByDateRangeForOrganization,
  deleteAllMessagesForUser,
  // getFeelings,
  postUserFeeling
} = require("../controllers/conversationController");

const router = express.Router();

router.get("/:organizationId/:fromId", getConversation);
router.put("/:organizationId/:fromId", updateConversation);
router.post("/", createConversation);
router.put('/:organizationId/sender/:fromId/messages/:messageId/delete', markMessageAsDeleted);
router.get('/', getConversations);
router.get('/:organizationId/media/:mediaId', getConversationsByMediaId);
router.get('/message/:organizationId/count', getMessageCountForOrganizationByDateRange);
router.get('/message/:organizationId/user-count', getUserCountByDateRangeForOrganization);
router.delete('/:organizationId/sender/:fromId/messages', deleteAllMessagesForUser);
router.post("/feeling", postUserFeeling);
// router.get("/feeling", getFeelings);

module.exports = router;