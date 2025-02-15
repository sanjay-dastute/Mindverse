require("dotenv").config();
const express = require("express");
// const axios = require("axios");
const {
  facebookLogin,
  sendOtp,
  verifyOtp,
  login,
  createOtherUser,
  updateOtherUser,
  instagramLogin,
} = require("../controllers/authController");
const router = express.Router();

// Facebook login
router.post("/sign-up", facebookLogin);
router.post("/login", login);
//Instagram login
router.post("/sign-up/instagram", instagramLogin);
// router.post("/login/instagram", login);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/other-user", createOtherUser);
router.patch("/other-user/:otherUserId", updateOtherUser);

module.exports = router;
