const multer = require('multer');
const path = require('path');

// Configure absolute path for uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(sanitizedFilename)}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'), false);
  }

  if (file.size > maxSize) {
    return cb(new Error('File size too large. Maximum size is 5MB.'), false);
  }

  cb(null, true);
};

// Configure multer with error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Allow only 1 file per request
  },
  fileFilter: fileFilter
}).single('avatar'); // Configure for single file upload with field name 'avatar'

// Wrapper function to handle multer errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error occurred
      return res.status(400).json({
        error: true,
        message: err.message
      });
    } else if (err) {
      // Unknown error occurred
      return res.status(500).json({
        error: true,
        message: err.message || 'An error occurred during file upload'
      });
    }
    // No error occurred
    next();
  });
};

module.exports = uploadMiddleware;