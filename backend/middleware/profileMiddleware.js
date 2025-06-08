const Profile = require('../dbmodel/Profile');
const { errorHandler } = require('./errorHandler');

const profileMiddleware = {
  getProfile: async (req, res) => {
    try {
      console.log('Getting profile for user:', req.user.id);
      let profile = await Profile.findOne({ user: req.user.id });
      
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
      errorHandler(error, res, 'Error fetching profile');
    }
  },

  updateProfile: async (req, res) => {
    try {
      console.log('Updating profile:', req.body);
      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { 
          $set: {
            bio: req.body.bio,
            socialLinks: req.body.socialLinks,
            'preferences.theme': req.body.theme,
            'preferences.notifications': req.body.notifications
          }
        },
        { new: true, runValidators: true }
      );

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Profile update error:', error);
      errorHandler(error, res, 'Error updating profile');
    }
  },

  updateAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      console.log('Uploading avatar:', req.file);
      const avatarUrl = `/uploads/${req.file.filename}`;
      
      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: { avatar: avatarUrl } },
        { new: true }
      );

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.json({ 
        message: 'Avatar updated successfully',
        avatar: avatarUrl,
        profile
      });
    } catch (error) {
      console.error('Avatar update error:', error);
      errorHandler(error, res, 'Error updating avatar');
    }
  },

  getStats: async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      const stats = {
        totalTasks: profile.statistics.totalTasks,
        completedTasks: profile.statistics.completedTasks,
        streak: profile.statistics.streak,
        completionRate: profile.getCompletionRate(),
        lastActive: profile.statistics.lastActive
      };

      res.json({ statistics: stats });
    } catch (error) {
      console.error('Stats fetch error:', error);
      errorHandler(error, res, 'Error fetching statistics');
    }
  },
  updatePreferences: async (req, res) => {
    try {
      const { theme, notifications } = req.body;

      // Validate theme
      if (theme && !['light', 'dark'].includes(theme)) {
        return res.status(400).json({ message: 'Invalid theme value' });
      }

      // Find and update profile
      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        {
          $set: {
            'preferences.theme': theme,
            'preferences.notifications': notifications
          }
        },
        { new: true, runValidators: true }
      );

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.json({
        message: 'Preferences updated successfully',
        preferences: profile.preferences
      });

    } catch (error) {
      console.error('Preferences update error:', error);
      errorHandler(error, res, 'Error updating preferences');
    }
  },
  // Update task statistics
  updateStats: async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      await profile.updateTaskStats(req.body.completed);
      await profile.updateStreak();

      res.json({
        completionRate: profile.getCompletionRate(),
        statistics: profile.statistics
      });
    } catch (error) {
      console.error('Stats update error:', error);
      errorHandler(error, res, 'Error updating statistics');
    }
  }
};

module.exports = profileMiddleware;