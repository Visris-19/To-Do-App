const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  theme: {
    type: String,
    enum: ['dark', 'light', 'system'],
    default: 'dark'
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  taskReminders: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    enum: ['en', 'es', 'fr'],
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);