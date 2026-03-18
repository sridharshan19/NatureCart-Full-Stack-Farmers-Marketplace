const express = require("express");
const adminController = require("../controllers/adminController");
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/analytics", authMiddleware, role("admin"), analyticsController.getAnalytics);
router.get(
  "/analytics/export",
  authMiddleware,
  role("admin"),
  analyticsController.exportAnalyticsCsv
);
router.get(
  "/analytics/top-products",
  authMiddleware,
  role("admin"),
  adminController.getTopProducts
);

module.exports = router;
