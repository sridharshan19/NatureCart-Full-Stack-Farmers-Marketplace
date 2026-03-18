const router = require("express").Router();
const product = require("../controllers/productController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/",
  auth,
  role("farmer", "admin"),
  upload.single("image"),
  product.createProduct
);
router.get("/", product.getProducts);

module.exports = router;
