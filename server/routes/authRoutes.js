const router = require("express").Router();
const auth = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/forgot-password", auth.requestPasswordReset);
router.post("/reset-password", auth.resetPassword);
router.post("/setup-admin", auth.setupAdmin);
router.post(
  "/admin/farmers",
  authMiddleware,
  role("admin"),
  auth.createFarmerByAdmin
);

module.exports = router;
