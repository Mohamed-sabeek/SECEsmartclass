const express = require('express');
const router = express.Router();
const { getTeacherAttendanceAnalytics } = require('../controllers/attendanceController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

router.get('/teacher', protect, teacherOnly, getTeacherAttendanceAnalytics);

// @desc Debug: raw attendance data for the logged-in teacher
// @route GET /api/attendance/debug
// @access Private (Teacher)
router.get('/debug', protect, teacherOnly, async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacher = await User.findById(teacherId).select('assignedClasses classAssignments').lean();
    const assignedClasses = teacher.assignedClasses || [];

    const allSessions = await Session.find({ teacherId }).select('_id classId section subject status startTime').lean();
    const endedSessions = allSessions.filter(s => s.status === 'ENDED');
    const sessionIds = endedSessions.map(s => s._id);

    const attendanceRecords = await Attendance.find({ sessionId: { $in: sessionIds } })
      .select('studentId sessionId status attendancePercentage')
      .lean();

    const students = await User.find({ role: 'student', classId: { $in: assignedClasses } })
      .select('name section classId studentDetails')
      .lean();

    res.json({
      assignedClasses,
      totalSessions: allSessions.length,
      endedSessions: endedSessions.length,
      sessionsDetail: allSessions.map(s => ({
        id: s._id,
        classId: s.classId,
        section: s.section,
        subject: s.subject,
        status: s.status
      })),
      attendanceRecordCount: attendanceRecords.length,
      attendanceSample: attendanceRecords.slice(0, 5),
      studentCount: students.length,
      studentSample: students.slice(0, 5).map(s => ({
        name: s.name,
        section: s.section,
        classId: s.classId
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
