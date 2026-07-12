import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    quantity: { type: Number, default: 1, min: 1 },
    price: { type: Number, required: true }, // snapshot at order time

    deliveryAddress: {
      city: { type: String, default: "" },
      details: { type: String, default: "" },
    },
    notes: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "rejected", "cancelled"],
      default: "pending",
    },

    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;