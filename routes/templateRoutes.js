import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { uploadThumbnail } from "../middleware/uploadMiddleware.js";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlistStatus,
  saveTemplate,
  getSavedTemplates,
  getAllSavedTemplates,
  getSavedTemplate,
  updateSavedTemplate,
  updateTemplateVisibility,
  updateTemplateThumbnail,
  deleteSavedTemplate,
  recordExport,
  getExportedTemplates,
  deleteExportedTemplate,
} from "../controllers/templateController.js";

const router = express.Router();

// Wishlist routes
router.post("/wishlist", auth, addToWishlist);
router.delete("/wishlist/:templateSlug", auth, removeFromWishlist);
router.get("/wishlist", auth, getWishlist);
router.get("/wishlist/check/:templateSlug", auth, checkWishlistStatus);

// Saved templates routes
router.post("/saved", auth, uploadThumbnail.single("thumbnail"), saveTemplate);
router.get("/saved", auth, getSavedTemplates);
router.get("/saved/all", getAllSavedTemplates); // Public route for templates page
// Allow public access to saved templates (for viewing/editing public templates)
router.get("/saved/:id", getSavedTemplate);
router.put("/saved/:id", auth, uploadThumbnail.single("thumbnail"), updateSavedTemplate);
router.patch("/saved/:id/visibility", auth, updateTemplateVisibility); // Update visibility only
router.patch("/saved/:id/thumbnail", auth, uploadThumbnail.single("thumbnail"), updateTemplateThumbnail); // Update thumbnail only
router.delete("/saved/:id", auth, deleteSavedTemplate);

// Exported templates routes
router.post("/exported", auth, recordExport);
router.get("/exported", auth, getExportedTemplates);
router.delete("/exported/:id", auth, deleteExportedTemplate);

export default router;

