import { Wishlist } from "../models/Wishlist.js";
import { SavedTemplate } from "../models/SavedTemplate.js";
import { ExportedTemplate } from "../models/ExportedTemplate.js";

// ========== WISHLIST CONTROLLERS ==========

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateSlug, templateName, templateThumbnail, templateCategory } = req.body;

    if (!templateSlug || !templateName) {
      return res.status(400).json({ message: "Template slug and name are required" });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ user: userId, templateSlug });
    if (existing) {
      return res.status(400).json({ message: "Template already in wishlist" });
    }

    const wishlistItem = await Wishlist.create({
      user: userId,
      templateSlug,
      templateName,
      templateThumbnail,
      templateCategory,
    });

    return res.status(201).json({ message: "Added to wishlist", wishlistItem });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return res.status(500).json({ error: "Server error adding to wishlist" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateSlug } = req.params;

    const deleted = await Wishlist.findOneAndDelete({ user: userId, templateSlug });
    if (!deleted) {
      return res.status(404).json({ message: "Template not found in wishlist" });
    }

    return res.status(200).json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    return res.status(500).json({ error: "Server error removing from wishlist" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ wishlist });
  } catch (err) {
    console.error("Get wishlist error:", err);
    return res.status(500).json({ error: "Server error fetching wishlist" });
  }
};

export const checkWishlistStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateSlug } = req.params;
    const exists = await Wishlist.findOne({ user: userId, templateSlug });
    return res.status(200).json({ inWishlist: !!exists });
  } catch (err) {
    console.error("Check wishlist status error:", err);
    return res.status(500).json({ error: "Server error checking wishlist status" });
  }
};

// ========== SAVED TEMPLATES CONTROLLERS ==========

export const saveTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, originalTemplateSlug, layout, thumbnail, isPublic } = req.body;

    if (!name || !layout) {
      return res.status(400).json({ message: "Name and layout are required" });
    }

    // Handle thumbnail - can be URL, base64 data URL, or file path
    let thumbnailUrl = thumbnail;
    if (req.file) {
      // If file was uploaded via multer
      thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
    } else if (thumbnail && thumbnail.startsWith("data:image")) {
      // Base64 data URL - store as is (or convert to file if needed)
      thumbnailUrl = thumbnail;
    } else if (thumbnail) {
      // External URL or existing path
      thumbnailUrl = thumbnail;
    }

    const savedTemplate = await SavedTemplate.create({
      user: userId,
      name,
      originalTemplateSlug,
      layout,
      thumbnail: thumbnailUrl || "",
      isPublic: isPublic || false,
    });

    return res.status(201).json({ message: "Template saved", template: savedTemplate });
  } catch (err) {
    console.error("Save template error:", err);
    return res.status(500).json({ error: "Server error saving template" });
  }
};

export const getSavedTemplates = async (req, res) => {
  try {
    const userId = req.user.id;
    const templates = await SavedTemplate.find({ user: userId })
      .populate("user", "name username email")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ templates });
  } catch (err) {
    console.error("Get saved templates error:", err);
    return res.status(500).json({ error: "Server error fetching saved templates" });
  }
};

// Get all saved templates (for templates page - public view)
export const getAllSavedTemplates = async (req, res) => {
  try {
    const templates = await SavedTemplate.find({ isPublic: true })
      .populate("user", "name username email")
      .sort({ updatedAt: -1 })
      .limit(50); // Limit to prevent too much data
    return res.status(200).json({ templates });
  } catch (err) {
    console.error("Get all saved templates error:", err);
    return res.status(500).json({ error: "Server error fetching saved templates" });
  }
};

export const getSavedTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional - for public templates
    
    // Allow access if template is public OR if user owns it
    const query = { _id: id };
    if (userId) {
      query.$or = [
        { isPublic: true },
        { user: userId }
      ];
    } else {
      // If no user, only allow public templates
      query.isPublic = true;
    }
    
    const template = await SavedTemplate.findOne(query).populate("user", "name username email");
    
    if (!template) {
      return res.status(404).json({ message: "Template not found or access denied" });
    }

    return res.status(200).json({ template });
  } catch (err) {
    console.error("Get saved template error:", err);
    return res.status(500).json({ error: "Server error fetching template" });
  }
};

export const updateSavedTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, layout, thumbnail, isPublic } = req.body;

    const updateData = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (layout !== undefined) updateData.layout = layout;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // Handle thumbnail update
    if (thumbnail !== undefined) {
      let thumbnailUrl = thumbnail;
      if (req.file) {
        // If file was uploaded via multer
        thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
      } else if (thumbnail && thumbnail.startsWith("data:image")) {
        // Base64 data URL - store as is
        thumbnailUrl = thumbnail;
      } else if (thumbnail) {
        // External URL or existing path
        thumbnailUrl = thumbnail;
      }
      updateData.thumbnail = thumbnailUrl;
    }

    const template = await SavedTemplate.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true }
    ).populate("user", "name username email");

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({ message: "Template updated", template });
  } catch (err) {
    console.error("Update saved template error:", err);
    return res.status(500).json({ error: "Server error updating template" });
  }
};

// Update thumbnail only
export const updateTemplateThumbnail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { thumbnail } = req.body;

    let thumbnailUrl = thumbnail;
    if (req.file) {
      thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
    } else if (thumbnail && thumbnail.startsWith("data:image")) {
      thumbnailUrl = thumbnail;
    } else if (thumbnail) {
      thumbnailUrl = thumbnail;
    }

    const template = await SavedTemplate.findOneAndUpdate(
      { _id: id, user: userId },
      { thumbnail: thumbnailUrl || "", updatedAt: new Date() },
      { new: true }
    ).populate("user", "name username email");

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({ message: "Thumbnail updated", template });
  } catch (err) {
    console.error("Update thumbnail error:", err);
    return res.status(500).json({ error: "Server error updating thumbnail" });
  }
};

// Update visibility only
export const updateTemplateVisibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { isPublic } = req.body;

    if (typeof isPublic !== "boolean") {
      return res.status(400).json({ message: "isPublic must be a boolean" });
    }

    const template = await SavedTemplate.findOneAndUpdate(
      { _id: id, user: userId },
      { isPublic, updatedAt: new Date() },
      { new: true }
    ).populate("user", "name username email");

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({ message: "Visibility updated", template });
  } catch (err) {
    console.error("Update visibility error:", err);
    return res.status(500).json({ error: "Server error updating visibility" });
  }
};

export const deleteSavedTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const deleted = await SavedTemplate.findOneAndDelete({ _id: id, user: userId });
    
    if (!deleted) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({ message: "Template deleted" });
  } catch (err) {
    console.error("Delete saved template error:", err);
    return res.status(500).json({ error: "Server error deleting template" });
  }
};

// ========== EXPORTED TEMPLATES CONTROLLERS ==========

export const recordExport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, exportType, status, fileSize, layout } = req.body;

    if (!name || !exportType) {
      return res.status(400).json({ message: "Name and export type are required" });
    }

    const exportedTemplate = await ExportedTemplate.create({
      user: userId,
      name,
      exportType,
      status: status || "completed",
      fileSize,
      layout,
    });

    return res.status(201).json({ message: "Export recorded", export: exportedTemplate });
  } catch (err) {
    console.error("Record export error:", err);
    return res.status(500).json({ error: "Server error recording export" });
  }
};

export const getExportedTemplates = async (req, res) => {
  try {
    const userId = req.user.id;
    const exports = await ExportedTemplate.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ exports });
  } catch (err) {
    console.error("Get exported templates error:", err);
    return res.status(500).json({ error: "Server error fetching exported templates" });
  }
};

export const deleteExportedTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const deleted = await ExportedTemplate.findOneAndDelete({ _id: id, user: userId });
    
    if (!deleted) {
      return res.status(404).json({ message: "Export not found" });
    }

    return res.status(200).json({ message: "Export deleted" });
  } catch (err) {
    console.error("Delete exported template error:", err);
    return res.status(500).json({ error: "Server error deleting export" });
  }
};

