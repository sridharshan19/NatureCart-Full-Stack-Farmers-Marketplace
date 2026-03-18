const router = require("express").Router();
const pickup = require("../controllers/pickupController");

router.get("/", pickup.getSlots);

module.exports = router;