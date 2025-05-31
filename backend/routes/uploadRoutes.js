import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Middleware to extract folder from query, body, or headers
const getUploadFolder = (req, res, next) => {
  // Check in this order: query param -> header -> body -> default
  req.uploadFolder =
    req.query.folder ||
    req.headers["x-upload-folder"] ||
    "others";
  next();
};

// POST /api/upload/single
router.post("/single", protect, getUploadFolder, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "File too large (max 5MB)",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Upload failed",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    res.json({
      success: true,
      imageUrl: req.file.path,
      publicId: req.file.filename,
      folder: req.uploadFolder,
    });
  });
});

// POST /api/upload/multiple
router.post("/multiple", protect, getUploadFolder, (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "One or more files are too large (max 5MB each)",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Upload failed",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const urls = req.files.map((file) => ({
      imageUrl: file.path,
      publicId: file.filename,
    }));

    res.json({
      success: true,
      images: urls,
      folder: req.uploadFolder,
    });
  });
});

// DELETE /api/upload/:publicId
router.delete("/:publicId", protect, async (req, res) => {
  try {
    const { publicId } = req.params;

    // Cloudinary requires public ID without folder prefix
    const shortId = publicId.split("/").pop();

    const result = await cloudinary.uploader.destroy(shortId, {
      invalidate: true,
      resource_type: "image",
    });

    if (result.result !== "ok") {
      return res.status(400).json({
        success: false,
        message: "Delete failed: " + (result.result || "Unknown error"),
      });
    }

    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during deletion",
    });
  }
});

export default router;
