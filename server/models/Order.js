const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consumer",
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        farmerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Farmer",
        },
        productName: String,
        quantity: Number,
        price: Number,
        status: {
          type: String,
          enum: ["pending", "confirmed", "completed"],
          default: "pending",
        },
      },
    ],
    totalAmount: Number,
    pickupDate: String,
    pickupTime: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
