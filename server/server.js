require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

console.log("[BOOT] Starting NatureCart server...");
console.log("[BOOT] Environment", {
  port: process.env.PORT || 5000,
  mongoConfigured: Boolean(process.env.MONGO_URI),
  jwtConfigured: Boolean(process.env.JWT_SECRET),
});

connectDB();

app.listen(process.env.PORT || 5000, () =>
  console.log(`[BOOT] Server running on port ${process.env.PORT || 5000}`)
);
