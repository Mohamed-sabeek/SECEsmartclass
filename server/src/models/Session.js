const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['LIVE', 'ENDED'],
    default: 'LIVE'
  },
  sessionCode: {
    type: String,
    unique: true,
    sparse: true // Allows historical sessions without codes to exist
  },
  meetingLink: {
    type: String
  },
  // Basic structure for attendance count (will be used for full tracking later)
  attendanceCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
