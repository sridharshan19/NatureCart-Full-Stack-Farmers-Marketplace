const analyticsService = require("../services/analyticsService");

exports.getTopProducts = async (req, res, next) => {
  try {
    const data = await analyticsService.getTopProducts();
    res.json(data);
  } catch (error) {
    next(error);
  }
};
