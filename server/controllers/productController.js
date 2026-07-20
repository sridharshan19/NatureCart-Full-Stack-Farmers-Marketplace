const Product = require("../models/Product");

exports.createProduct = async (req, res, next) => {
  try {
    const farmerId =
      req.user.role === "admin" ? req.body.farmerId : req.user.id;

    if (!farmerId) {
      return res.status(400).json({
        message: "Farmer ID is required when an admin creates a product.",
      });
    }

    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.imageUrl || req.body.image || "";

    const product = await Product.create({
      productName: req.body.productName,
      category: req.body.category,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      unit: req.body.unit || "kg",
      image: imagePath,
      farmerId,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "farmerId",
      "name email farmName location"
    );

    console.log("[PRODUCT] created", {
      productId: product._id.toString(),
      productName: product.productName,
      actorId: req.user.id,
      actorRole: req.user.role,
      farmerId,
      imagePath,
    });
    res.status(201).json(populatedProduct);
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort, inStock } = req.query;
    const query = {};

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { productName: searchRegex },
        { category: searchRegex },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === "true") {
      query.quantity = { $gt: 0 };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "name_asc") sortOption = { productName: 1 };

    const products = await Product.find(query)
      .populate("farmerId", "name email farmName location")
      .sort(sortOption);

    console.log("[PRODUCT] fetched_all", { count: products.length, filters: req.query });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

