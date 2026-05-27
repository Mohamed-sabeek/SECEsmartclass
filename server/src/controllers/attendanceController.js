const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Helper: normalize section — null / undefined / empty / 'none' / 'NONE' all mean "no section"
const normalizeSection = (s) => {
  if (!s || s.trim().toLowerCase() === 'none') return null;
  return s.toUpperCase().trim();
};

// @desc Get teacher's student attendance analytics with backend pagination and search
// @route GET /api/attendance/teacher
// @access Private (Teacher)
const getTeacherAttendanceAnalytics = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId, section, search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Find ALL ended sessions for this teacher (not filtered by assignedClasses)
    //    This matches exactly what the dashboard does — teacherId is the source of truth
    const sessionQuery = {
      teacherId,
      status: 'ENDED'
    };

    if (classId) {
      sessionQuery.classId = classId;
    }

    if (section && section !== 'ALL') {
      sessionQuery.$or = [
        { section: section },
        { section: { $exists: false } },
        { section: null },
        { section: '' },
        { section: 'none' },
        { section: 'NONE' }
      ];
    }

    const sessions = await Session.find(sessionQuery)
      .select('_id classId section status attendanceCount')
      .lean();
    const sessionIds = sessions.map(s => s._id);

    // Collect unique classIds from actual sessions (more reliable than assignedClasses)
    const sessionClassIds = [...new Set(sessions.map(s => s.classId.toString()))];

    // 2. Get Attendance records for these sessions (status: 'present')
    const attendanceRecords = await Attendance.find({
      sessionId: { $in: sessionIds },
      status: 'present'
    }).select('studentId sessionId').lean();

    // Build per-student present-count map from Attendance collection
    const attendanceByStudent = {};
    attendanceRecords.forEach(a => {
      const sid = a.studentId.toString();
      attendanceByStudent[sid] = (attendanceByStudent[sid] || 0) + 1;
    });

    // 3. If no attendance records but session.attendanceCount > 0,
    //    fall back to session.students array for attendance data
    const hasAttendanceRecords = attendanceRecords.length > 0;

    // 4. Build student query from actual session class IDs (not assignedClasses)
    const targetClassIds = classId ? [classId] : sessionClassIds;

    if (targetClassIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: { page, limit, totalCount: 0, totalPages: 0 },
        stats: { totalStudents: 0, avgPercentage: 0, totalSessions: sessions.length }
      });
    }

    const studentQuery = {
      role: 'student',
      classId: { $in: targetClassIds }
    };

    if (section && section !== 'ALL') {
      studentQuery.section = section;
    }

    if (search) {
      studentQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'studentDetails.rollNo': { $regex: search, $options: 'i' } }
      ];
    }

    const allStudents = await User.find(studentQuery)
      .select('name studentDetails classId section email')
      .lean();

    // 5. If Attendance collection has no records, fallback:
    //    load session.students from the full session to get who joined
    let sessionStudentMap = {}; // sessionId -> Set of studentIds who were present
    if (!hasAttendanceRecords && sessions.length > 0) {
      // Re-fetch sessions with students array for fallback
      const sessionsWithStudents = await Session.find({
        _id: { $in: sessionIds }
      }).select('_id students').lean();

      sessionsWithStudents.forEach(sess => {
        (sess.students || []).forEach(entry => {
          const sid = entry.studentId.toString();
          attendanceByStudent[sid] = (attendanceByStudent[sid] || 0) + 1;
        });
      });
    }

    // 6. Calculate per-student analytics
    let totalPercentageSum = 0;

    const allCalculated = allStudents.map(student => {
      const sid = student._id.toString();
      const studentSection = normalizeSection(student.section);

      // Sessions the student should have attended:
      // – same class AND:
      //   • session has no section → applies to all students, OR
      //   • student has no section (NONE) → attends all sessions of their class, OR
      //   • sections match exactly
      const sessionsForStudent = sessions.filter(s => {
        if (s.classId.toString() !== student.classId?.toString()) return false;
        const sessionSection = normalizeSection(s.section);
        return sessionSection === null || studentSection === null || sessionSection === studentSection;
      });

      const totalClasses = sessionsForStudent.length;
      const presentCount = attendanceByStudent[sid] || 0;
      const absentCount = Math.max(0, totalClasses - presentCount);
      const percentage = totalClasses > 0
        ? parseFloat(((presentCount / totalClasses) * 100).toFixed(1))
        : 0;

      totalPercentageSum += percentage;

      return {
        studentId: sid,
        name: student.name,
        rollNumber: student.studentDetails?.rollNo || 'N/A',
        section: student.section || 'None',
        totalClasses,
        presentCount,
        absentCount,
        percentage
      };
    });

    allCalculated.sort((a, b) => a.name.localeCompare(b.name));

    const totalStudents = allCalculated.length;
    const avgPercentage = totalStudents > 0
      ? parseFloat((totalPercentageSum / totalStudents).toFixed(1))
      : 0;

    // totalSessions = max sessions any student could have attended (class-filtered, matches the per-student "Total" column)
    const totalSessions = allCalculated.length > 0
      ? Math.max(...allCalculated.map(s => s.totalClasses))
      : sessions.length;

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
        totalSessions
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
