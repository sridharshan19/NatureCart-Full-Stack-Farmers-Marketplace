const mongoose = require("mongoose");

const consumerSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    phone: String,
    address: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consumer", consumerSchema);
