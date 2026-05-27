const mongoose = require('mongoose');

const scheduledSessionSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: String,
    uppercase: true,
    trim: true,
    default: undefined
  },
  subject: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'CANCELLED', 'COMPLETED'],
    default: 'SCHEDULED'
  }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledSession', scheduledSessionSchema);
