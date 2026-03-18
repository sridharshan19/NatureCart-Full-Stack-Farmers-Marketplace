require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const normalizeProductName = (value = "") => {
  const normalized = value.trim().toLowerCase();

  if (normalized.endsWith("oes")) {
    return `${normalized.slice(0, -2)}`;
  }

  if (normalized.endsWith("ies")) {
    return `${normalized.slice(0, -3)}y`;
  }

  if (normalized.endsWith("s") && !normalized.endsWith("ss")) {
    return normalized.slice(0, -1);
  }

  return normalized;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({}, "_id farmerId productName").lean();
  const productMap = new Map();

  products.forEach((product) => {
    productMap.set(normalizeProductName(product.productName), product);
  });

  const orders = await Order.find({});
  let updatedOrders = 0;

  for (const order of orders) {
    let changed = false;

    order.products = order.products.map((item) => {
      const matchedProduct =
        item.productId && item.farmerId
          ? null
          : productMap.get(normalizeProductName(item.productName));

      if (!matchedProduct) {
        return item;
      }

      changed = true;

      return {
        ...item.toObject(),
        productId: item.productId || matchedProduct._id,
        farmerId: item.farmerId || matchedProduct.farmerId,
        productName: matchedProduct.productName,
      };
    });

    if (changed) {
      updatedOrders += 1;
      await order.save();
    }
  }

  console.log(
    JSON.stringify(
      {
        migrated: true,
        updatedOrders,
        totalOrders: orders.length,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
