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
  subject: {
    type: String,
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
    sparse: true
  },
  meetingLink: {
    type: String
  },
  students: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    logs: [{
      joinTime: {
        type: Date,
        default: Date.now
      },
      leaveTime: {
        type: Date
      }
    }],
    _id: false
  }],
  attendanceCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
