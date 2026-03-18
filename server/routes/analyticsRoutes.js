const express = require("express");
const router = express.Router();

const {
  getAnalytics,
  exportAnalyticsCsv,
} = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, role("admin"), getAnalytics);
router.get("/export", authMiddleware, role("admin"), exportAnalyticsCsv);

module.exports = router;
