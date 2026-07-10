import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["product", "service", "user"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetModel" },
    targetModel: { type: String, required: true, enum: ["Product", "Service", "User"] },

    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }, // optional, links service review to a completed booking

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: true }
);

// Prevent same user from reviewing same target twice
reviewSchema.index({ targetId: 1, reviewerId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;