const router = require("express").Router();
const cart = require("../controllers/cartController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.use(auth, role("consumer"));

router.get("/", cart.getCart);
router.post("/", cart.addToCart);
router.put("/:productId", cart.updateCartItem);
router.delete("/:productId", cart.removeCartItem);
router.delete("/", cart.clearCart);

module.exports = router;
