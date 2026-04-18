const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// @desc Get teacher's student attendance analytics
// @route GET /api/attendance/teacher
// @access Private (Teacher)
const getTeacherAttendanceAnalytics = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId } = req.query;

    // 1. Get the teacher's profile to know their assigned classes
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const assignedClasses = teacher.assignedClasses || [];
    
    // 2. Filter classes if classId is provided
    const targetClassIds = classId ? [classId] : assignedClasses;

    if (targetClassIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 3. Find all students in these classes
    const students = await User.find({
      role: 'student',
      classId: { $in: targetClassIds }
    }).select('name studentDetails classId email');

    // 4. Find all sessions for these classes by this teacher
    const sessions = await Session.find({
      teacherId,
      classId: { $in: targetClassIds }
    }).select('_id classId');

    // Create a map for session counts per class
    const sessionsByClass = {};
    sessions.forEach(s => {
      const cid = s.classId.toString();
      sessionsByClass[cid] = (sessionsByClass[cid] || 0) + 1;
    });

    const sessionIds = sessions.map(s => s._id);

    // 5. Get attendance records for these sessions
    const attendanceRecords = await Attendance.find({
      sessionId: { $in: sessionIds },
      status: 'present'
    });

    // Create a map for attendance counts per student
    const attendanceByStudent = {};
    attendanceRecords.forEach(a => {
      const sid = a.studentId.toString();
      attendanceByStudent[sid] = (attendanceByStudent[sid] || 0) + 1;
    });

    // 6. Calculate analytics for each student
    const result = students.map(student => {
      const cid = student.classId.toString();
      const sid = student._id.toString();

      const totalClasses = sessionsByClass[cid] || 0;
      const presentCount = attendanceByStudent[sid] || 0;
      const absentCount = Math.max(0, totalClasses - presentCount);
      const percentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;

      return {
        studentId: sid,
        name: student.name,
        rollNumber: student.studentDetails?.rollNo || 'N/A',
        totalClasses,
        presentCount,
        absentCount,
        percentage: Number(percentage)
      };
    });

    // Sort by roll number or name
    result.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('ATTENDANCE ANALYTICS ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error',
      error: error.message 
    });
  }
});

module.exports = {
  getTeacherAttendanceAnalytics
};
