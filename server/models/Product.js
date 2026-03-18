const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
    },
    productName: String,
    category: String,
    price: Number,
    quantity: Number,
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);