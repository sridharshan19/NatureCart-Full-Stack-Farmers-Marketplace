const mongoose = require("mongoose");
const Order = require("../models/Order");
const Farmer = require("../models/Farmer");

const buildOrderMatch = ({ farmerId, date }) => {
  const match = {};

  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    match.createdAt = { $gte: start, $lte: end };
  }

  if (farmerId && mongoose.Types.ObjectId.isValid(farmerId)) {
    match["products.farmerId"] = new mongoose.Types.ObjectId(farmerId);
  }

  return match;
};

const buildItemMatch = ({ farmerId }) => {
  if (farmerId && mongoose.Types.ObjectId.isValid(farmerId)) {
    return {
      "products.farmerId": new mongoose.Types.ObjectId(farmerId),
    };
  }

  return {};
};

const getAnalyticsSummary = async ({ farmerId, date } = {}) => {
  const orderMatch = buildOrderMatch({ farmerId, date });
  const itemMatch = buildItemMatch({ farmerId });

  const revenueData = await Order.aggregate([
    {
      $match: {
        ...orderMatch,
        status: { $in: ["confirmed", "completed"] },
      },
    },
    { $unwind: "$products" },
    { $match: itemMatch },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $multiply: ["$products.quantity", "$products.price"] },
        },
      },
    },
  ]);

  const salesTrend = await Order.aggregate([
    { $match: orderMatch },
    { $unwind: "$products" },
    { $match: itemMatch },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalSales: {
          $sum: { $multiply: ["$products.quantity", "$products.price"] },
        },
        orderIds: { $addToSet: "$_id" },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        totalSales: 1,
        totalOrders: { $size: "$orderIds" },
      },
    },
  ]);

  const topProducts = await Order.aggregate([
    { $match: orderMatch },
    { $unwind: "$products" },
    { $match: itemMatch },
    {
      $group: {
        _id: "$products.productName",
        totalSold: { $sum: "$products.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$products.quantity", "$products.price"] },
        },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  const highestSoldProduct = topProducts[0]
    ? {
        name: topProducts[0]._id,
        totalSold: topProducts[0].totalSold,
        totalRevenue: topProducts[0].totalRevenue,
      }
    : null;

  const topFarmerRevenue = await Order.aggregate([
    { $match: orderMatch },
    { $unwind: "$products" },
    { $match: { ...itemMatch, "products.farmerId": { $ne: null } } },
    {
      $group: {
        _id: "$products.farmerId",
        totalRevenue: {
          $sum: { $multiply: ["$products.quantity", "$products.price"] },
        },
        totalUnits: { $sum: "$products.quantity" },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
  ]);

  const farmerIds = topFarmerRevenue.map((item) => item._id);
  const farmers = await Farmer.find({ _id: { $in: farmerIds } }, "name farmName email").lean();
  const farmerMap = new Map(farmers.map((farmer) => [farmer._id.toString(), farmer]));

  const topFarmers = topFarmerRevenue.map((item) => {
    const farmer = farmerMap.get(item._id.toString());

    return {
      _id: item._id,
      name: farmer?.farmName || farmer?.name || "Unknown farmer",
      email: farmer?.email || "",
      totalRevenue: item.totalRevenue,
      totalUnits: item.totalUnits,
    };
  });

  const statusBreakdown = await Order.aggregate([
    { $match: orderMatch },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const ordersReceived = await Order.find(orderMatch)
    .populate("consumerId", "name email")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return {
    revenue: revenueData[0]?.totalRevenue || 0,
    totalOrders: statusBreakdown.reduce((sum, item) => sum + item.count, 0),
    appliedFilters: {
      farmerId: farmerId || "",
      date: date || "",
    },
    statusBreakdown,
    salesTrend,
    highestSoldProduct,
    topProducts,
    topFarmers,
    ordersReceived,
  };
};

const getTopProducts = async () => {
  const analytics = await getAnalyticsSummary();
  return analytics.topProducts;
};

module.exports = {
  getAnalyticsSummary,
  getTopProducts,
};
