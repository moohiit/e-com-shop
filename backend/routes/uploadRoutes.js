import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/upload/single
router.post('/single', protect, upload.single('image'), (req, res) => {
  res.json({
    success: true,
    imageUrl: req.file.path,
    publicId: req.file.filename,
  });
});

// POST /api/upload/multiple
router.post('/multiple', protect, upload.array('images', 5), (req, res) => {
  const urls = req.files.map(file => ({
    imageUrl: file.path,
    publicId: file.filename,
  }));

  res.json({
    success: true,
    images: urls,
  });
});

// DELETE /api/upload/:publicId
router.delete('/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return res.status(400).json({ success: false, message: 'Delete failed' });
    }

    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
