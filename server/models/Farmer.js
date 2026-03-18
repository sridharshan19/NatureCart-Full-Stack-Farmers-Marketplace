const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    phone: String,
    farmName: String,
    location: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farmer", farmerSchema);
