const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// @desc Get student dashboard stats
// @route GET /api/student/dashboard
// @access Private (Student)
const getStudentDashboard = asyncHandler(async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);

    if (!student || !student.classId) {
      return res.status(200).json({
        success: true,
        data: { totalClasses: 0, attendedClasses: 0, percentage: 0 }
      });
    }

    // 1. Total sessions conducted for student's class
    const totalClasses = await Session.countDocuments({ 
      classId: student.classId
    });

    // 2. Classes attended by the student
    const sessionsOfClass = await Session.find({ classId: student.classId }).select('_id');
    const sessionIds = sessionsOfClass.map(s => s._id);

    const attendedClasses = await Attendance.countDocuments({
      studentId,
      sessionId: { $in: sessionIds },
      status: 'present'
    });

    const percentage = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalClasses,
        attendedClasses,
        percentage: Number(percentage)
      }
    });
  } catch (error) {
    console.error('STUDENT DASHBOARD ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc Get student attendance summary
// @route GET /api/student/attendance
// @access Private (Student)
const getStudentAttendance = asyncHandler(async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);

    if (!student || !student.classId) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Total sessions conducted for student's class
    const totalClasses = await Session.countDocuments({ 
      classId: student.classId
    });

    const sessionsOfClass = await Session.find({ classId: student.classId }).select('_id');
    const sessionIds = sessionsOfClass.map(s => s._id);

    const presentCount = await Attendance.countDocuments({
      studentId,
      sessionId: { $in: sessionIds },
      status: 'present'
    });

    const absentCount = Math.max(0, totalClasses - presentCount);
    const percentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalClasses,
        presentCount,
        absentCount,
        percentage: Number(percentage)
      }
    });
  } catch (error) {
    console.error('STUDENT ATTENDANCE ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc Get student session history
// @route GET /api/student/history
// @access Private (Student)
const getStudentHistory = asyncHandler(async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);

    if (!student || !student.classId) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get all sessions for this student's class (LIVE or ENDED)
    const sessions = await Session.find({ 
      classId: student.classId
    })
    .populate('teacherId', 'name')
    .populate('classId', 'className section year')
    .sort({ startTime: -1 });

    const sessionIds = sessions.map(s => s._id);

    // Get which ones the student attended
    const attendanceRecords = await Attendance.find({
      studentId,
      sessionId: { $in: sessionIds },
      status: 'present'
    }).select('sessionId');

    const attendedSessionIds = new Set(attendanceRecords.map(a => a.sessionId.toString()));

    const result = sessions.map(session => ({
      _id: session._id,
      className: session.classId ? 
        `${session.classId.className} (S-${session.classId.section})` : 
        'Class',
      teacherName: session.teacherId?.name || 'Faculty',
      startTime: session.startTime,
      endTime: session.endTime,
      status: attendedSessionIds.has(session._id.toString()) ? 'Present' : 'Absent'
    }));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('STUDENT HISTORY ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = {
  getStudentDashboard,
  getStudentAttendance,
  getStudentHistory
};
