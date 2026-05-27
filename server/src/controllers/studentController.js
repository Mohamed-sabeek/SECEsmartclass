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
    const student = await User.findById(studentId).select('classId').lean();

    if (!student || !student.classId) {
      return res.status(200).json({ success: true, data: { totalClasses: 0, presentCount: 0, absentCount: 0, percentage: 0 } });
    }

    // Total sessions conducted for student's class
    const totalClasses = await Session.countDocuments({ 
      classId: student.classId
    });

    const sessionsOfClass = await Session.find({ classId: student.classId }).select('_id').lean();
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

// @desc Get student session history with pagination and status/date filtering
// @route GET /api/student/history
// @access Private (Student)
const getStudentHistory = asyncHandler(async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, date } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const student = await User.findById(studentId).select('classId').lean();

    if (!student || !student.classId) {
      return res.status(200).json({ 
        success: true, 
        data: [],
        pagination: { page, limit, totalCount: 0, totalPages: 0 }
      });
    }

    // Fetch all attendance records for this student
    const attendanceQuery = { studentId };
    if (status && status !== 'All') {
      attendanceQuery.status = status.toLowerCase(); // 'present' or 'absent'
    }

    const attendanceRecords = await Attendance.find(attendanceQuery)
      .select('sessionId status duration attendancePercentage')
      .lean();

    const attendanceMap = new Map(
      attendanceRecords.map(a => [a.sessionId.toString(), a])
    );

    // Build Session query
    const sessionQuery = { classId: student.classId };
    
    // If status filter is active, only fetch sessions matching the status
    if (status && status !== 'All') {
      const matchingSessionIds = attendanceRecords.map(a => a.sessionId);
      sessionQuery._id = { $in: matchingSessionIds };
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      sessionQuery.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const totalCount = await Session.countDocuments(sessionQuery);
    const totalPages = Math.ceil(totalCount / limit);

    // Get all sessions for this student's class
    const sessions = await Session.find(sessionQuery)
      .select('_id classId teacherId startTime endTime')
      .populate('teacherId', 'name')
      .populate('classId', 'className section year')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const result = sessions.map(session => {
      const record = attendanceMap.get(session._id.toString());
      return {
        _id: session._id,
        className: session.classId ? 
          `${session.classId.className}` : 
          'Class',
        teacherName: session.teacherId?.name || 'Faculty',
        startTime: session.startTime,
        endTime: session.endTime,
        status: record ? (record.status === 'present' ? 'Present' : 'Absent') : 'Absent',
        duration: record?.duration || '0 secs',
        attendancePercentage: record?.attendancePercentage || 0
      };
    });

    res.status(200).json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('STUDENT HISTORY ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc Get teachers assigned to student's class
// @route GET /api/student/teachers
// @access Private (Student)
const getStudentTeachers = asyncHandler(async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);

    if (!student || !student.classId) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Find teachers whose assignedClasses array contains the student's classId
    const teachers = await User.find({
      role: 'teacher',
      assignedClasses: student.classId
    })
    .select('name email avatar teacherDetails assignedClasses classAssignments')
    .populate({
      path: 'assignedClasses',
      select: 'className departmentId section year',
      populate: {
        path: 'departmentId',
        select: 'name code'
      }
    });

    const result = teachers.map(teacher => {
      // Find the specific class details for the student's class among teacher's assignments
      const studentClass = teacher.assignedClasses.find(c => c._id.toString() === student.classId.toString());
      
      // Find the specific subject assigned to this class
      const assignment = teacher.classAssignments?.find(a => a.classId.toString() === student.classId.toString());
      
      return {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        avatar: teacher.avatar,
        subject: assignment?.subject || teacher.teacherDetails?.subjects?.[0] || 'Faculty Member',
        department: studentClass?.departmentId?.name || 'Academic Faculty',
        className: studentClass?.className || 'N/A'
      };
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('STUDENT TEACHERS ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = {
  getStudentDashboard,
  getStudentAttendance,
  getStudentHistory,
  getStudentTeachers
};
