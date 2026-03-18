const Order = require("../models/Order");
const inventoryService = require("./inventoryService");

exports.createOrder = async (consumerId, data) => {
  let total = 0;
  const orderProducts = [];

  for (let item of data.products) {
    const product = await inventoryService.updateStock(
      {
        productId: item.productId,
        productName: item.productName,
      },
      item.quantity
    );

    total += item.quantity * product.price;
    orderProducts.push({
      productId: product._id,
      farmerId: product.farmerId,
      productName: product.productName,
      quantity: item.quantity,
      price: product.price,
      status: "pending",
    });
  }

  const order = await Order.create({
    consumerId,
    products: orderProducts,
    totalAmount: total,
    pickupDate: data.pickupDate,
    pickupTime: data.pickupTime,
  });

  return order;
};
