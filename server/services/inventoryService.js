const Product = require("../models/Product");

exports.updateStock = async ({ productId, productName }, quantity) => {
  const normalizedName = productName?.trim();

  if (!productId && !normalizedName) {
    throw new Error("productId or productName is required");
  }

  const product = productId
    ? await Product.findById(productId)
    : await Product.findOne({
        productName: { $regex: `^${normalizedName}$`, $options: "i" },
      });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.quantity < quantity) {
    throw new Error("Out of stock");
  }

  product.quantity -= quantity;
  await product.save();

  return product;
};
