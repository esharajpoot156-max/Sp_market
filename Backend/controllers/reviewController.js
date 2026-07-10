import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

// Helper: recalculate average rating on the target
const updateTargetRating = async (targetType, targetId) => {
  const reviews = await Review.find({ targetId });
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  if (targetType === "product") {
    await Product.findByIdAndUpdate(targetId, { rating: { average, count } });
  } else if (targetType === "service") {
    await Service.findByIdAndUpdate(targetId, { rating: { average, count } });
  } else if (targetType === "user") {
    await User.findByIdAndUpdate(targetId, { rating: { average, count } });
  }
};

// Create a review
export const createReview = async (req, res, next) => {
  try {
    const { targetType, targetId, rating, comment, bookingId } = req.body;

    if (!targetType || !targetId || !rating) {
      return res.status(400).json({ message: "Please provide targetType, targetId and rating" });
    }

    const modelMap = { product: "Product", service: "Service", user: "User" };
    const targetModel = modelMap[targetType];

    if (!targetModel) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    // If reviewing a service, require a completed booking
    if (targetType === "service") {
      if (!bookingId) {
        return res.status(400).json({ message: "bookingId is required to review a service" });
      }
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.status !== "completed") {
        return res.status(400).json({ message: "You can only review a completed booking" });
      }
      if (booking.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to review this booking" });
      }
    }

    const review = await Review.create({
      targetType,
      targetId,
      targetModel,
      reviewerId: req.user._id,
      bookingId: bookingId || undefined,
      rating,
      comment,
    });

    await updateTargetRating(targetType, targetId);

    const populatedReview = await review.populate("reviewerId", "name profilePicture");

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this" });
    }
    next(error);
  }
};

// Get all reviews for a target (product/service/user)
export const getReviewsForTarget = async (req, res, next) => {
  try {
    const { targetId } = req.params;

    const reviews = await Review.find({ targetId })
      .populate("reviewerId", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// Delete a review (own review or admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.reviewerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    const { targetType, targetId } = review;
    await review.deleteOne();
    await updateTargetRating(targetType, targetId);

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};