const pickupService = require("../services/pickupService");

exports.getSlots = (req, res) => {
  const slots = pickupService.getAvailableSlots();
  res.json(slots);
};