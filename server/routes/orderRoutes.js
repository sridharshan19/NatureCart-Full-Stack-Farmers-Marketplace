const router = require("express").Router();
const order = require("../controllers/orderController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.post("/", auth, role("consumer"), order.placeOrder);
router.get("/", auth, role("consumer"), order.getConsumerOrders);

module.exports = router;
