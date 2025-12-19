import mongoose from "mongoose";

const savedTemplateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    originalTemplateSlug: { type: String, required: false }, // Original template if based on one
    layout: { type: Array, required: true }, // Full layout with sections and props
    thumbnail: { type: String, required: false },
    isPublic: { type: Boolean, default: false }, // Visibility setting
  },
  { timestamps: true }
);

export const SavedTemplate = mongoose.model("SavedTemplate", savedTemplateSchema);

