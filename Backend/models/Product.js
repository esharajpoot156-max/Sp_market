import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    images: [{ type: String }], // Cloudinary URLs
    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    condition: { type: String, enum: ["new", "used"], default: "new" },
    stock: { type: Number, default: 1 },

    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: { type: String, enum: ["pending", "approved", "removed"], default: "pending" },
    isSold: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;