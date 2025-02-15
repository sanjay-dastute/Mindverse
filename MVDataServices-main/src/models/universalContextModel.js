// src/models/universalContextModel.js
const mongoose = require("mongoose");

const UniversalContextSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = UniversalContextSchema;