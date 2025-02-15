const express = require("express");
const {
  getAllRequests,
  createSupportRequest,
  getMessagesForRequest,
  addMessageToRequest,
  resolveSupportRequest
} = require("../controllers/supportController");

const router = express.Router();

router.get("/requests/:organizationId", getAllRequests);
router.post("/requests/:organizationId", createSupportRequest);
router.get("/requests/:organizationId/:requestId/messages", getMessagesForRequest);
router.post("/requests/:organizationId/:requestId/messages", addMessageToRequest);
router.put("/requests/:organizationId/:requestId/resolve", resolveSupportRequest);


module.exports = router;
