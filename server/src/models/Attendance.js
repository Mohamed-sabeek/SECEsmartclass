const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present'
  },
  duration: {
    type: String,
    default: '0 secs'
  },
  attendancePercentage: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Ensure a student only has one attendance entry per session
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1 });
attendanceSchema.index({ sessionId: 1 });
attendanceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
