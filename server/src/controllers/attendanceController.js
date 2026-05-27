const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc Get teacher's student attendance analytics with backend pagination and search
// @route GET /api/attendance/teacher
// @access Private (Teacher)
const getTeacherAttendanceAnalytics = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId, search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Get the teacher's profile to know their assigned classes
    const teacher = await User.findById(teacherId).select('assignedClasses').lean();
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const assignedClasses = teacher.assignedClasses || [];
    
    // 2. Filter classes if classId is provided
    const targetClassIds = classId ? [classId] : assignedClasses;

    if (targetClassIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: { page, limit, totalCount: 0, totalPages: 0 },
        stats: { totalStudents: 0, avgPercentage: 0, totalSessions: 0 }
      });
    }

    // 3. Find all target sessions for these classes by this teacher
    const sessions = await Session.find({
      teacherId,
      classId: { $in: targetClassIds }
    }).select('_id classId').lean();

    // Create a map for session counts per class
    const sessionsByClass = {};
    sessions.forEach(s => {
      const cid = s.classId.toString();
      sessionsByClass[cid] = (sessionsByClass[cid] || 0) + 1;
    });

    const sessionIds = sessions.map(s => s._id);

    // 4. Get attendance records for these sessions
    const attendanceRecords = await Attendance.find({
      sessionId: { $in: sessionIds },
      status: 'present'
    }).select('studentId sessionId').lean();

    // Create a map for attendance counts per student
    const attendanceByStudent = {};
    attendanceRecords.forEach(a => {
      const sid = a.studentId.toString();
      attendanceByStudent[sid] = (attendanceByStudent[sid] || 0) + 1;
    });

    // 5. Query ALL students matching filters to compute global stats
    const studentQuery = {
      role: 'student',
      classId: { $in: targetClassIds }
    };

    if (search) {
      studentQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'studentDetails.rollNo': { $regex: search, $options: 'i' } }
      ];
    }

    const allStudents = await User.find(studentQuery)
      .select('name studentDetails classId email')
      .lean();

    // 6. Calculate analytics for ALL matched students to calculate avgPercentage
    let totalPercentageSum = 0;
    let maxTotalClasses = 0;

    const allCalculated = allStudents.map(student => {
      const cid = student.classId?.toString() || '';
      const sid = student._id.toString();

      const totalClasses = sessionsByClass[cid] || 0;
      const presentCount = attendanceByStudent[sid] || 0;
      const absentCount = Math.max(0, totalClasses - presentCount);
      const percentage = totalClasses > 0 ? parseFloat(((presentCount / totalClasses) * 100).toFixed(1)) : 0;

      totalPercentageSum += percentage;
      if (totalClasses > maxTotalClasses) {
        maxTotalClasses = totalClasses;
      }

      return {
        studentId: sid,
        name: student.name,
        rollNumber: student.studentDetails?.rollNo || 'N/A',
        totalClasses,
        presentCount,
        absentCount,
        percentage
      };
    });

    // Sort by name
    allCalculated.sort((a, b) => a.name.localeCompare(b.name));

    const totalStudents = allCalculated.length;
    const avgPercentage = totalStudents > 0 ? parseFloat((totalPercentageSum / totalStudents).toFixed(1)) : 0;

    // 7. Paginate the calculated analytics array
    const paginatedStudents = allCalculated.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalStudents / limit);

    res.status(200).json({
      success: true,
      data: paginatedStudents,
      pagination: {
        page,
        limit,
        totalCount: totalStudents,
        totalPages
      },
      stats: {
        totalStudents,
        avgPercentage,
        totalSessions: maxTotalClasses
      }
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
