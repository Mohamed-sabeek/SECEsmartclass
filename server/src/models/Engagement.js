const mongoose = require('mongoose');

const engagementSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  tabSwitchCount: {
    type: Number,
    default: 0
  },
  lastSwitchTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Create a unique index for student per session
engagementSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Engagement', engagementSchema);
