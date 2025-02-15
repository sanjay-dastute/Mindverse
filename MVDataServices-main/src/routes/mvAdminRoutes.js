const express = require("express");
const {
  getAllUniversalContexts,
  updateUniversalContext,
  getAllUsers,
  getAllSupportRequestsForMVAdmin,
  getMessageCountByDateRange,
  getSupportRequestCount,
  getUserCountByDateRange,
  getActiveUserCount,
  getInactiveUserCount,
} = require("../controllers/mvAdminController");

const router = express.Router();

router.get("/universal-context", getAllUniversalContexts);
router.put("/universal-context/:id", updateUniversalContext);
router.get("/all-users", getAllUsers);
router.get("/support-requests", getAllSupportRequestsForMVAdmin);
router.get("/message/count", getMessageCountByDateRange);
router.get("/support-requests/count", getSupportRequestCount);
router.get("/users/count", getUserCountByDateRange);
router.get('/active-user/count', getActiveUserCount);
router.get('/inactive-user/count', getInactiveUserCount);

module.exports = router;
