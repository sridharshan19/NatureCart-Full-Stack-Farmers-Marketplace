const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  const farmerId =
    req.user.role === "admin" ? req.body.farmerId : req.user.id;

  if (!farmerId) {
    return res.status(400).json({
      message: "Farmer ID is required when an admin creates a product.",
    });
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

  const product = await Product.create({
    productName: req.body.productName,
    category: req.body.category,
    price: Number(req.body.price),
    quantity: Number(req.body.quantity),
    image: imagePath,
    farmerId,
  });

  const populatedProduct = await Product.findById(product._id).populate("farmerId");
  console.log("[PRODUCT] created", {
    productId: product._id.toString(),
    productName: product.productName,
    actorId: req.user.id,
    actorRole: req.user.role,
    farmerId,
    imagePath,
  });
  res.json(populatedProduct);
};

exports.getProducts = async (req, res) => {
  const products = await Product.find().populate("farmerId");
  console.log("[PRODUCT] fetched_all", { count: products.length });
  res.json(products);
};
