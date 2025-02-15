const express = require("express");
const {
  createPayment,
  verifyPayment,
  getAllPaymentsByOrganizationId,
  getPaymentByOrderId,
  createSubscription,
  verifySubscription
} = require("../controllers/paymentController");

const router = express.Router();

// router.get("/", getAllPayments);
router.get("/", getAllPaymentsByOrganizationId);
router.post("/", createPayment);
router.post("/verify-payment", verifyPayment);
router.get("/byOrderId", getPaymentByOrderId);
router.post("/subscription", createSubscription);
router.post("/subscription/verify", verifySubscription);

module.exports = router;