import mongoose from "mongoose";

const exportedTemplateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    exportType: { type: String, required: true, enum: ["html", "react", "nextjs"] },
    status: { type: String, required: true, default: "completed", enum: ["completed", "failed"] },
    fileSize: { type: Number, required: false }, // Size in bytes
    layout: { type: Array, required: false }, // Optional: store layout for reference
  },
  { timestamps: true }
);

export const ExportedTemplate = mongoose.model("ExportedTemplate", exportedTemplateSchema);

