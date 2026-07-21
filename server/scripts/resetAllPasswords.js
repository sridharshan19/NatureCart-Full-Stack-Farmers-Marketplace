require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Farmer = require("../models/Farmer");
const Consumer = require("../models/Consumer");

async function resetAllPasswords() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/farmers_marketplace";
    await mongoose.connect(mongoUri);

    const adminHash = await bcrypt.hash("Admin@123", 10);
    const farmerHash = await bcrypt.hash("Farmer@123", 10);
    const consumerHash = await bcrypt.hash("Consumer@123", 10);

    await Admin.updateMany({}, { $set: { password: adminHash } });
    await Farmer.updateMany({}, { $set: { password: farmerHash } });
    await Consumer.updateMany({}, { $set: { password: consumerHash } });

    console.log("SUCCESS: All account passwords reset!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error resetting passwords:", err);
    process.exit(1);
  }
}

resetAllPasswords();
