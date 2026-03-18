const Product = require("../models/Product");

exports.seedProducts = async () => {
  await Product.insertMany([
    {
      productName: "Carrot",
      category: "Vegetables",
      price: 30,
      quantity: 100,
    },
    {
      productName: "Potatoes",
      category: "Vegetables",
      price: 20,
      quantity: 200,
    },

  ]);
};
