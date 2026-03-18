const orderService = require("../services/orderService");
const Order = require("../models/Order");

exports.placeOrder = async (req, res) => {
  const order = await orderService.createOrder(
    req.user.id,
    req.body
  );

  console.log("[ORDER] placed", {
    orderId: order._id.toString(),
    consumerId: req.user.id,
    items: order.products.length,
    totalAmount: order.totalAmount,
    pickupDate: order.pickupDate,
    pickupTime: order.pickupTime,
  });
  res.json(order);
};

exports.getConsumerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ consumerId: req.user.id })
      .populate("consumerId", "name email")
      .populate("products.farmerId", "name farmName")
      .sort({ createdAt: -1 });

    console.log("[ORDER] consumer_orders_fetched", {
      consumerId: req.user.id,
      count: orders.length,
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};
