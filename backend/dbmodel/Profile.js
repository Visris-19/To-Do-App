const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxLength: 500,
    default: ''
  },
  socialLinks: {
    twitter: {
      type: String,
      trim: true,
      default: ''
    },
    linkedin: {
      type: String,
      trim: true,
      default: ''
    },
    github: {
      type: String,
      trim: true,
      default: ''
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  statistics: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
//profileSchema.index({ user: 1 });
profileSchema.index({ 'statistics.lastActive': -1 });

// Add validation for social links
profileSchema.path('socialLinks.twitter').validate(function(url) {
  if (!url) return true;
  return url.startsWith('https://twitter.com/');
}, 'Twitter URL must start with https://twitter.com/');

profileSchema.path('socialLinks.linkedin').validate(function(url) {
  if (!url) return true;
  return url.startsWith('https://linkedin.com/in/');
}, 'LinkedIn URL must start with https://linkedin.com/in/');

profileSchema.path('socialLinks.github').validate(function(url) {
  if (!url) return true;
  return url.startsWith('https://github.com/');
}, 'GitHub URL must start with https://github.com/');

// Add a method to update task statistics
profileSchema.methods.updateTaskStats = async function(completedTask = false) {
  this.statistics.totalTasks += 1;
  if (completedTask) {
    this.statistics.completedTasks += 1;
  }
  this.statistics.lastActive = new Date();
  await this.save();
};

// Add method to calculate completion rate
profileSchema.methods.getCompletionRate = function() {
  if (this.statistics.totalTasks === 0) return 0;
  return (this.statistics.completedTasks / this.statistics.totalTasks * 100).toFixed(1);
};

// Add method to update streak
profileSchema.methods.updateStreak = async function() {
  const today = new Date();
  const lastActive = this.statistics.lastActive;
  
  if (!lastActive) {
    this.statistics.streak = 1;
  } else {
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day, increase streak
      this.statistics.streak += 1;
    } else if (diffDays > 1) {
      // Break in streak, reset to 1
      this.statistics.streak = 1;
    }
    // If diffDays === 0, same day, don't change streak
  }
  
  this.statistics.lastActive = today;
  await this.save();
};

// Add pre-save middleware to ensure username and email are in sync with User model
profileSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('user')) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.user);
      if (user) {
        this.username = user.username;
        this.email = user.email;
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;