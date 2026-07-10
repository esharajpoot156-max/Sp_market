import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["message", "booking", "review", "listing_approved", "listing_rejected", "system"],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String, default: "" }, // frontend route to navigate to (e.g. /bookings/123)
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;