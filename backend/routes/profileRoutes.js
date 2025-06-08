const express = require('express');
const router = express.Router();
const Profile = require('../dbmodel/Profile');
const authMiddleware = require('../middleware/authMiddleware');
const profileMiddleware = require('../middleware/profileMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
}

// Apply auth middleware to all routes
router.use(authMiddleware);

// Profile routes with file upload handling
router.get('/profile', async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    
    // Create profile if it doesn't exist
    if (!profile) {
      profile = new Profile({
        user: req.user.id,
        username: req.user.username,
        email: req.user.email
      });
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

router.put('/profile/update', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated session
    
    const existingProfile = await Profile.findOne({ user: userId });
    if (!existingProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update profile fields
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { 
        $set: {
          bio: req.body.bio,
          'socialLinks.twitter': req.body.socialLinks?.twitter,
          'socialLinks.linkedin': req.body.socialLinks?.linkedin,
          'socialLinks.github': req.body.socialLinks?.github,
          'preferences.theme': req.body.theme,
          'preferences.notifications': req.body.notifications
        }
      },
      { new: true }
    );

    res.json(updatedProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.post('/profile/avatar', upload.single('avatar'), profileMiddleware.updateAvatar);

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large. Max size is 5MB'
      });
    }
    return res.status(400).json({
      message: error.message
    });
  }
  next(error);
});

// Statistics routes
router.get('/profile/stats', profileMiddleware.getStats);
router.post('/profile/stats/update', profileMiddleware.updateStats);

// Preferences routes
router.put('/profile/preferences', profileMiddleware.updatePreferences);

module.exports = router;