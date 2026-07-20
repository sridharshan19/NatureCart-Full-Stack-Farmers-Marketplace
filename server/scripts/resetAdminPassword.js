require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function resetAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/naturecart";
    await mongoose.connect(mongoUri);

    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    const result = await Admin.updateMany({}, { $set: { password: hashedPassword } });

    console.log("SUCCESS: Admin passwords updated.");
    console.log("Matched Count:", result.matchedCount);
    console.log("Modified Count:", result.modifiedCount);

    const admins = await Admin.find({});
    console.log("ADMIN ACCOUNTS FOUND:");
    admins.forEach((a) => {
      console.log(`- Email: ${a.email} | Name: ${a.name}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error resetting admin password:", error);
    process.exit(1);
  }
}

resetAdmin();
