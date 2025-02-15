const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  orgination_id: String,
  phone_no: String,
  otp: String,
  status: { type: String, default: "active" },
  expiry: Date,
  created_at: { type: Date, default: Date.now },
});

module.exports = otpSchema;
