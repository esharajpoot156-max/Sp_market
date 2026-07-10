import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    targetType: { type: String, enum: ["product", "service", "user", "review"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },

    reason: { type: String, required: true },
    description: { type: String, default: "", maxlength: 500 },

    status: { type: String, enum: ["pending", "reviewed", "dismissed"], default: "pending" },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;