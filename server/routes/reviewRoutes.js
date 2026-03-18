const router = require("express").Router();
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, role("admin", "farmer", "consumer"), reviewController.getReviews);
router.post("/", auth, role("consumer"), reviewController.createReview);

module.exports = router;
