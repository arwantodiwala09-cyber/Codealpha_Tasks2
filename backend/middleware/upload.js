const multer = require('multer');
const { cloudinary, storage } = require('../config/cloudinary');
const ErrorHandler = require('../utils/errorHandler');

// Multer upload for single and multiple images
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ErrorHandler('Not an image! Please upload only images.', 400), false);
    }
  },
});

// Upload single image
exports.uploadSingle = upload.single('image');

// Upload multiple images (up to 10)
exports.uploadMultiple = upload.array('images', 10);

// Upload multiple fields
exports.uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'avatar', maxCount: 1 },
]);

// Delete image from cloudinary
exports.deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

// Upload to cloudinary with options
exports.uploadToCloudinary = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'ecommerce',
      ...options,
    });
    return result;
  } catch (error) {
    throw new ErrorHandler('Error uploading to Cloudinary', 500);
  }
};