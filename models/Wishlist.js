import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    templateSlug: { type: String, required: true },
    templateName: { type: String, required: true },
    templateThumbnail: { type: String, required: false },
    templateCategory: { type: String, required: false },
  },
  { timestamps: true }
);

// Ensure one user can't add the same template twice
wishlistSchema.index({ user: 1, templateSlug: 1 }, { unique: true });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);

