const express = require('express');
const router = express.Router();
const Settings = require('../dbmodel/Settings');
const User = require('../dbmodel/user');
const authMiddleware = require('../middleware/authMiddleware');

// Get user settings
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });
    
    if (!settings) {
      settings = await Settings.create({ user: req.user.id });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

// Update settings
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

// Delete account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // Delete user's tasks, settings, and other related data
    
    // Delete user's settings
    await Settings.deleteOne({ user: userId });

    // Delete user's tasks
    await List.deleteMany({ user: userId });

    // Delete user
    await User.deleteOne({ id: userId });
    
    
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
    });
    
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

// Export user data
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const userData = await User.findById(req.user.id).select('-password');
    const userSettings = await Settings.findOne({ user: req.user.id });
    // Add other data you want to export
    
    res.json({
      user: userData,
      settings: userSettings,
      // Add other data here
    });
  } catch (error) {
    res.status(500).json({ message: 'Error exporting data', error: error.message });
  }
});

module.exports = router;