const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    organizationId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    buyingLink: {
      type: String,
      default: "",
    },
    paymentLink: {
      type: String,
      default: "",
    },
    shippingPolicy: {
      type: String,
      default: "",
    },
    productDescription: {
      type: String,
      default: "",
    },
    returnPolicy: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      required: false,
    },
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

module.exports = ProductSchema;
