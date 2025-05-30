import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    try {
      const baseFolder = 'ecommerce';
      // Get folder from req.uploadFolder set in the route middleware
      const subFolder = req.uploadFolder || 'others';
      const folder = `${baseFolder}/${subFolder}`;
      
      // Clean filename for public_id (remove special chars)
      const cleanName = file.originalname.replace(/\.[^/.]+$/, "").replace(/[^\w-]/g, '-');
      const publicId = `${Date.now()}-${cleanName}`;

      return {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
        public_id: publicId,
        transformation: [
          {
            width: 500,
            height: 500,
            crop: 'fill',
            gravity: 'auto',
            fetch_format: 'auto',
            quality: 'auto'
          }
        ],
      };
    } catch (error) {
      console.error('Error in multer storage params:', error);
      throw error;
    }
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default upload;