// src/models/userModel.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    media_type: String,
    timestamp: String,
    media_url: String,
    thumbnail_url: String,
    permalink: String,
    comments_count: Number,
    caption: String,
    media_product_type: String,
    comments: {
      data: [
        {
          id: String,
          text: String,
          like_count: Number,
          timestamp: String,
          replies: {
            data: [
              {
                id: String,
                text: String,
                like_count: Number,
                timestamp: String,
              },
            ],
          },
        },
      ],
    },
    like_count: Number,
    owner: {
      id: String,
    },
    taggedProduct: {
      type: String,
      required: false,
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

const SettingSchema = new mongoose.Schema(
  {
    shop_domain: {
      type: String,
      required: true,
    },
    access_token: {
      type: String,
      required: true,
    },
    webhook_validation_hash: {
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    updated_by: {
      type: String,
      default: "system",
    },
    created_by: {
      type: String,
      default: "system",
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

const ResponseTemplateSchema = new mongoose.Schema(
  {
    about: {
      type: String,
      required: false,
    },
    specialInstructions: {
      type: String,
      required: false,
    },
    shippingPolicy: {
      type: String,
      required: false,
    },
    returnPolicy: {
      type: String,
      required: false,
    },
    paymentType: {
      type: String,
      required: false,
    },
  }
);

const TeamMemberSchema = new mongoose.Schema(
  {
    otherUserId: {
      type: String,
      required: true,
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

const PromptSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
});

// Define the arrayLimit function
function arrayLimit(val) {
  return val.length === 3;
}

const UserSchema = new mongoose.Schema(
  {
    instagramId: {
      type: String,
      required: true,
      unique: true,
    },
    facebookPageId: {
      type: String,
      required: false,
    },
    instagramUserName: {
      type: String,
      required: true,
      unique: true,
    },
    instagramName: {
      type: String,
      required: true,
      unique: true,
    },
    longLivedAccessToken: {
      type: String,
      required: true,
    },
    isSubscriptionEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    organizationId: {
      type: String,
      required: false,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    organizationName: {
      type: String,
      required: false,
    },
    contactPhoneNumber: {
      type: String,
      required: false,
    },
    contactPerson: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    instagramLogin: {
      type: Boolean,
      default: false,
    },
    prompts: {
      type: [PromptSchema],
      validate: [arrayLimit, '{PATH} must contain exactly 3 elements'],
    },
    role: {
      type: String,
      required: true,
      default: "ADMIN",
    },
    tier: {
      type: String,
      enum: ['FREE', 'TIER1', 'TIER2', 'TIER3', 'TIER4'],
      default: 'FREE',
      required: true
    },
    lastLogin: {
      type: Date,
      default: Date.now,
      required: true
    },
    posts: [PostSchema],
    setting: SettingSchema,
    responseTemplate: ResponseTemplateSchema,
    team: [TeamMemberSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);


module.exports = UserSchema;
