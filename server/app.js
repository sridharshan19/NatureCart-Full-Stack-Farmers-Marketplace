const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const errorHandler = require("./middleware/errorMiddleware");
const requestLogger = require("./middleware/requestLogger");
const allowedOrigins = (process.env.CLIENT_ORIGIN ||
  "http://localhost:5173,https://nature-cart-full-stack-farmers-marketplace-dgb4-zmevuiud1.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin is not allowed."));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(requestLogger);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/pickup", require("./routes/pickupRoutes"));
app.use("/api/farmer", require("./routes/farmerRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin/analytics", require("./routes/analyticsRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

module.exports = app;
