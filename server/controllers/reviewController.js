const Order = require("../models/Order");
const Review = require("../models/Review");

const getScopedReviewFilter = (req) => {
  if (req.user?.role === "admin") {
    return {};
  }

  if (req.user?.role === "farmer") {
    return { farmerId: req.user.id };
  }

  return { consumerId: req.user.id };
};

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find(getScopedReviewFilter(req))
      .populate("consumerId", "name email")
      .populate("farmerId", "name farmName email location")
      .populate("orderId", "pickupDate pickupTime createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { orderId, farmerId, rating, comment } = req.body;
    const normalizedRating = Number(rating);

    if (!orderId || !farmerId || !rating) {
      return res.status(400).json({
        message: "Order, farmer, and rating are required.",
      });
    }

    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({
        message: "Rating must be a whole number between 1 and 5.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      consumerId: req.user.id,
    }).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found for this consumer." });
    }

    const farmerItems = order.products.filter(
      (product) => product.farmerId?.toString() === farmerId.toString()
    );

    if (!farmerItems.length) {
      return res.status(400).json({
        message: "This farmer is not part of the selected order.",
      });
    }

    const allCompleted = farmerItems.every(
      (product) => (product.status || order.status) === "completed"
    );

    if (!allCompleted) {
      return res.status(400).json({
        message: "You can review a farmer only after the relevant order items are completed.",
      });
    }

    const existingReview = await Review.findOne({
      consumerId: req.user.id,
      farmerId,
      orderId,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this farmer for the selected order.",
      });
    }

    const review = await Review.create({
      consumerId: req.user.id,
      farmerId,
      orderId,
      rating: normalizedRating,
      comment: comment?.trim() || "",
    });

    const populatedReview = await Review.findById(review._id)
      .populate("consumerId", "name email")
      .populate("farmerId", "name farmName email location")
      .populate("orderId", "pickupDate pickupTime createdAt");

    console.log("[REVIEW] created", {
      reviewId: review._id.toString(),
      consumerId: req.user.id,
      farmerId,
      orderId,
      rating: normalizedRating,
    });

    res.status(201).json(populatedReview);
  } catch (error) {
    next(error);
  }
};
