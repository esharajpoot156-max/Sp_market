import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    deliveryTime: { type: Number, required: true }, // in days

    portfolioImages: [{ type: String }], // Cloudinary URLs

    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    availability: {
      days: [{ type: String }], // e.g. ["Monday", "Wednesday"]
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "18:00" },
    },

    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    status: { type: String, enum: ["pending", "approved", "removed"], default: "pending" },
    isActive: { type: Boolean, default: true },

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ title: "text", description: "text" });

const Service = mongoose.model("Service", serviceSchema);
export default Service;