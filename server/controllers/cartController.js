const Cart = require("../models/Cart");
const Product = require("../models/Product");

const buildCartResponse = (cart) => {
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.items.reduce((sum, item) => {
    const price = item.productId?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return {
    ...cart.toObject(),
    totalItems,
    totalAmount,
  };
};

const getOrCreateCart = async (consumerId) => {
  let cart = await Cart.findOne({ consumerId }).populate("items.productId");

  if (!cart) {
    cart = await Cart.create({ consumerId, items: [] });
    cart = await Cart.findOne({ consumerId }).populate("items.productId");
  }

  return cart;
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    console.log("[CART] fetched", {
      consumerId: req.user.id,
      items: cart.items.length,
    });
    res.json(buildCartResponse(cart));
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required." });
    }

    if (quantity < 1) {
      return res.status(400).json({ msg: "Quantity must be at least 1." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: "The selected product was not found." });
    }

    const cart = await getOrCreateCart(req.user.id);
    const existingItem = cart.items.find(
      (item) => item.productId._id.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ productId, quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate("items.productId");

    console.log("[CART] item_added", {
      consumerId: req.user.id,
      productId,
      quantity: Number(quantity),
      totalItems: cart.items.length,
    });
    res.status(201).json(buildCartResponse(cart));
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ msg: "Quantity must be at least 1." });
    }

    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.find(
      (entry) => entry.productId._id.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({ msg: "Cart item not found." });
    }

    item.quantity = Number(quantity);
    await cart.save();
    await cart.populate("items.productId");

    console.log("[CART] item_updated", {
      consumerId: req.user.id,
      productId: req.params.productId,
      quantity: Number(quantity),
    });
    res.json(buildCartResponse(cart));
  } catch (err) {
    next(err);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const initialCount = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.productId._id.toString() !== req.params.productId
    );

    if (cart.items.length === initialCount) {
      return res.status(404).json({ msg: "Cart item not found." });
    }

    await cart.save();
    await cart.populate("items.productId");

    console.log("[CART] item_removed", {
      consumerId: req.user.id,
      productId: req.params.productId,
      totalItems: cart.items.length,
    });
    res.json(buildCartResponse(cart));
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    await cart.populate("items.productId");

    console.log("[CART] cleared", {
      consumerId: req.user.id,
    });
    res.json(buildCartResponse(cart));
  } catch (err) {
    next(err);
  }
};
