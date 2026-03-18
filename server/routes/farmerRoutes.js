const router = require("express").Router();

const farmerController = require("../controllers/farmerController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");


// All routes below require farmer or admin role
router.use(auth, role("farmer", "admin"));


// 👤 Profile
router.get("/profile", farmerController.getFarmerProfile);
router.put("/profile", farmerController.updateFarmerProfile);


// 🌽 Products
router.get("/products", farmerController.getMyProducts);
router.delete("/products/:id", farmerController.deleteProduct);


// 📦 Orders
router.get("/orders", farmerController.getFarmerOrders);
router.put("/orders/:id", farmerController.updateOrderStatus);


module.exports = router;
