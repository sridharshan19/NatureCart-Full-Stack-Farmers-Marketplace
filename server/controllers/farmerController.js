const Farmer = require("../models/Farmer");
const Product = require("../models/Product");
const Order = require("../models/Order");

const isAdmin = (req) => req.user?.role === "admin";
const getTargetFarmerId = (req) => req.query.farmerId || req.params.farmerId;
const normalizeProductStatus = (product, fallbackStatus) =>
  product.status || fallbackStatus || "pending";

const deriveOrderStatus = (products) => {
  const statuses = products.map((product) => product.status || "pending");

  if (statuses.length && statuses.every((status) => status === "completed")) {
    return "completed";
  }

  if (
    statuses.length &&
    statuses.every((status) => ["confirmed", "completed"].includes(status))
  ) {
    return "confirmed";
  }

  return "pending";
};

exports.getFarmerProfile = async (req, res, next) => {
  try {
    if (isAdmin(req)) {
      const farmerId = getTargetFarmerId(req);

      if (farmerId) {
        const farmer = await Farmer.findById(farmerId).select("-password");

        if (!farmer) {
          return res.status(404).json({ message: "Farmer not found." });
        }

        return res.json(farmer);
      }

      const farmers = await Farmer.find().select("-password");
      return res.json(farmers);
    }

    const farmer = await Farmer.findById(req.user.id).select("-password");

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found." });
    }

    res.json(farmer);
  } catch (err) {
    next(err);
  }
};

exports.updateFarmerProfile = async (req, res, next) => {
  try {
    const farmerId = isAdmin(req) ? getTargetFarmerId(req) : req.user.id;

    if (!farmerId) {
      return res
        .status(400)
        .json({ message: "Farmer ID is required for admin updates." });
    }

    const updated = await Farmer.findByIdAndUpdate(
      farmerId,
      req.body,
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Farmer not found." });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.getMyProducts = async (req, res, next) => {
  try {
    const farmerId = isAdmin(req) ? getTargetFarmerId(req) : req.user.id;
    const filter = farmerId ? { farmerId } : {};
    const products = await Product.find(filter).populate(
      "farmerId",
      "name email farmName location"
    );

    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const filter = isAdmin(req)
      ? { _id: req.params.id }
      : { _id: req.params.id, farmerId: req.user.id };

    const product = await Product.findOne(filter);

    if (!product) {
      return res.status(404).json({
        message: "Product not found or you are not authorized to delete it.",
      });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully." });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const filter = isAdmin(req)
      ? { _id: req.params.id }
      : { _id: req.params.id, farmerId: req.user.id };

    const product = await Product.findOne(filter);

    if (!product) {
      return res.status(404).json({
        message: "Product not found or you are not authorized to update it.",
      });
    }

    const targetFarmerId =
      isAdmin(req) && req.body.farmerId ? req.body.farmerId : product.farmerId;

    product.productName = req.body.productName ?? product.productName;
    product.category = req.body.category ?? product.category;
    product.price =
      req.body.price !== undefined ? Number(req.body.price) : product.price;
    product.quantity =
      req.body.quantity !== undefined ? Number(req.body.quantity) : product.quantity;
    product.farmerId = targetFarmerId;

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();

    const populatedProduct = await Product.findById(product._id).populate(
      "farmerId",
      "name email farmName location"
    );

    res.json(populatedProduct);
  } catch (err) {
    next(err);
  }
};

exports.getFarmerOrders = async (req, res, next) => {
  try {
    const farmerId = isAdmin(req) ? getTargetFarmerId(req) : req.user.id;
    const filter = farmerId ? { "products.farmerId": farmerId } : {};

    const orders = await Order.find(filter)
      .populate("consumerId", "name email")
      .sort({ createdAt: -1 });

    const mappedOrders = orders.map((order) => {
      if (farmerId) {
        const scopedProducts = order.products.filter(
          (product) => product.farmerId?.toString() === farmerId.toString()
        );
        const normalizedProducts = scopedProducts.map((product) => ({
          ...product.toObject(),
          status: normalizeProductStatus(product, order.status),
        }));

        return {
          ...order.toObject(),
          products: normalizedProducts,
          scopedStatus: deriveOrderStatus(normalizedProducts),
        };
      }

      return {
        ...order.toObject(),
        products: order.products.map((product) => ({
          ...product.toObject(),
          status: normalizeProductStatus(product, order.status),
        })),
      };
    });

    res.json(mappedOrders);
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const targetFarmerId = isAdmin(req) ? getTargetFarmerId(req) : req.user.id;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (isAdmin(req) && !targetFarmerId) {
      order.products = order.products.map((product) => ({
        ...product.toObject(),
        status,
      }));
    } else {
      let updatedAnyProduct = false;

      order.products = order.products.map((product) => {
        if (product.farmerId?.toString() === targetFarmerId?.toString()) {
          updatedAnyProduct = true;
          return {
            ...product.toObject(),
            status,
          };
        }

        return {
          ...product.toObject(),
          status: normalizeProductStatus(product, order.status),
        };
      });

      if (!updatedAnyProduct) {
        return res.status(403).json({
          message: "You are not authorized to update this order for another farmer.",
        });
      }
    }

    order.status = deriveOrderStatus(order.products);
    await order.save();

    if (!isAdmin(req)) {
      const scopedProducts = order.products.filter(
        (product) => product.farmerId?.toString() === req.user.id.toString()
      );

      return res.json({
        ...order.toObject(),
        products: scopedProducts,
        scopedStatus: deriveOrderStatus(scopedProducts),
      });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};
