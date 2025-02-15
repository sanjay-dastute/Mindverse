// src/models/supportRequestModel.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
      enum: ["user", "support"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

const SupportRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    organizationId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Product', 'Profile', 'Response', 'Other'],
    },
    query: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "InProgress", "Resolved"],
      default: "Open",
    },
    messages: [MessageSchema],
    ticketId: {
      type: String,
      unique: true,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

// Pre-save middleware to generate the ticketId
SupportRequestSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const prefix = {
      'Product': 'PRD',
      'Profile': 'PRF',
      'Response': 'RSP',
      'Other': 'OSV'
    }[this.type];

    const lastRequest = await this.constructor.findOne({ type: this.type }).sort('-ticketId');
    let nextNumber = 1;

    if (lastRequest && lastRequest.ticketId) {
      const lastNumber = parseInt(lastRequest.ticketId.slice(3));
      nextNumber = lastNumber + 1;
    }

    this.ticketId = `${prefix}${nextNumber}`;
  }
  next();
});

module.exports = SupportRequestSchema;