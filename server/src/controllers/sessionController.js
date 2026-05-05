const Session = require('../models/Session');
const User = require('../models/User');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');

// @desc Start a new class session
// @route POST /api/sessions
// @access Private (Teacher)
const startSession = asyncHandler(async (req, res) => {
  try {
    const { classId, subject } = req.body;

    if (!classId) {
      return res.status(400).json({ success: false, message: 'Class ID is required' });
    }

    // Check if there's an existing LIVE session for this teacher
    const activeSession = await Session.findOne({ 
      teacherId: req.user.id, 
      status: 'LIVE' 
    });

    if (activeSession) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active class session',
        session: activeSession
      });
    }

    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const meetingLink = `https://meet.jit.si/sece-${sessionCode}`;

    // Get teacher's default subject if not provided
    const user = await User.findById(req.user.id);
    const finalSubject = subject || user.teacherDetails?.subject || 'General Session';

    const session = await Session.create({
      teacherId: req.user.id,
      classId,
      subject: finalSubject,
      startTime: new Date(),
      status: 'LIVE',
      sessionCode,
      meetingLink
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error('START SESSION ERROR:', error.message);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc End a class session
// @route PATCH /api/sessions/:id/end
// @access Private (Teacher)
const endSession = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Session ID' });
    }
    const session = await Session.findById(req.params.id);

    if (session.endTime) {
      return res.status(400).json({ success: false, message: 'Session already ended' });
    }

    // Verify ownership
    if (session.teacherId.toString() !== req.user.id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    session.endTime = new Date();
    session.status = 'ENDED';

    // Set leaveTime for all unclosed logs for all students
    session.students.forEach(student => {
      student.logs.forEach(log => {
        if (!log.leaveTime) {
          log.leaveTime = session.endTime;
        }
      });
    });

    await session.save();

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error('END SESSION ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc Get teacher's session history
// @route GET /api/sessions/history
// @access Private (Teacher)
const getTeacherHistory = asyncHandler(async (req, res) => {
  try {
    const sessions = await Session.find({ teacherId: req.user.id })
      .populate('classId', 'className year section')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error('GET HISTORY ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc Get active session based on role
// @route GET /api/sessions/active
// @access Private (Teacher/Student)
const getActiveSession = asyncHandler(async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const session = await Session.findOne({ 
        teacherId: req.user.id, 
        status: 'LIVE' 
      }).populate('classId', 'className year section');
      return res.status(200).json({ success: true, data: session });
    } 
    
    if (req.user.role === 'student' || req.user.role === 'admin') {
      const user = await User.findById(req.user.id);
      if (!user || !user.classId) {
        return res.status(200).json({ success: true, data: null });
      }

      const session = await Session.findOne({
        classId: user.classId,
        status: 'LIVE'
      }).populate('classId', 'className year section')
        .populate('teacherId', 'name');

      if (session) {
        const attendance = await Attendance.findOne({
          sessionId: session._id,
          studentId: req.user.id
        });
        
        return res.status(200).json({ 
          success: true, 
          data: { 
            ...session.toObject(), 
            isJoined: !!attendance 
          } 
        });
      }

      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: null });
  } catch (error) {
    console.error('GET ACTIVE ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc Get specific session details with attendance
// @route GET /api/sessions/:id
// @access Private (Teacher)
const getSessionDetails = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Session ID' });
    }
    const session = await Session.findById(req.params.id)
      .populate('classId', 'className year section')
      .populate('teacherId', 'name');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Verify ownership (only teacher who created or admin can view)
    if (req.user.role !== 'admin' && session.teacherId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const attendance = await Attendance.find({ sessionId: session._id })
      .populate('studentId', 'name studentDetails');

    res.status(200).json({
      success: true,
      data: {
        session,
        attendance
      }
    });
  } catch (error) {
    console.error('GET SESSION DETAILS ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc Join a session using session code or ID
// @route POST /api/sessions/join
// @access Private (Student)
const joinSession = asyncHandler(async (req, res) => {
  try {
    const { sessionCode, sessionId } = req.body;
    const studentId = req.user.id;

    if (!sessionCode && !sessionId) {
      return res.status(400).json({ success: false, message: 'Session identifier is required' });
    }

    // 1. Find the active session
    let session;
    if (sessionCode) {
      session = await Session.findOne({ sessionCode, status: 'LIVE' });
    } else {
      session = await Session.findOne({ _id: sessionId, status: 'LIVE' });
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'Active session not found' });
    }

    // 4. Update session tracking (multi-log support)
    const studentEntryIdx = session.students.findIndex(s => s.studentId.toString() === studentId.toString());

    if (studentEntryIdx === -1) {
      // First time joining
      session.students.push({
        studentId,
        logs: [{ joinTime: new Date() }]
      });
    } else {
      // Re-joining: Check if there's an already active log
      const activeLog = session.students[studentEntryIdx].logs.find(l => !l.leaveTime);
      if (!activeLog) {
        session.students[studentEntryIdx].logs.push({ joinTime: new Date() });
      }
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the session',
      data: session
    });
  } catch (error) {
    console.error('JOIN SESSION ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc Generate Jitsi JWT Token for secure joining
// @route POST /api/sessions/token
// @access Private
const getJitsiToken = asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const user = await User.findById(req.user.id);
    const appId = process.env.JITSI_APP_ID;
    const apiKeyId = process.env.JITSI_API_KEY_ID;
    const roomName = `sece-${session.sessionCode}`;
    const fullRoom = `${appId}/${roomName}`;
    const kid = `${appId}/${apiKeyId}`;

    console.log("JITSI ACTUAL - ROOM:", fullRoom);
    console.log("JITSI ACTUAL - APP_ID:", appId);
    console.log("JITSI ACTUAL - KEY_ID:", apiKeyId);
    console.log("JITSI ACTUAL - KID:", kid);

    const privateKeyRaw = process.env.JITSI_PRIVATE_KEY || '';
    const privateKey = privateKeyRaw.startsWith('"') && privateKeyRaw.endsWith('"') 
      ? privateKeyRaw.slice(1, -1).replace(/\\n/g, '\n')
      : privateKeyRaw.replace(/\\n/g, '\n');

    if (!privateKey) {
      console.error("CRITICAL: JITSI_PRIVATE_KEY is missing from environment!");
    }

    console.log("JITSI FINAL - ISS: chat");
    console.log("JITSI FINAL - SUB:", appId);

    // Token configuration for JaaS (8x8.vc) standard
    const token = jwt.sign(
      {
        aud: 'jitsi',
        iss: 'chat',
        sub: appId,
        room: roomName,
        context: {
          user: {
            name: user.name,
            email: user.email,
            id: user._id,
            avatar: '',
            moderator: user.role === 'teacher'
          }
        }
      },
      privateKey,
      { 
        algorithm: 'RS256',
        expiresIn: '3h',
        header: {
          kid: kid
        }
      }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        room: fullRoom,
        meetingUrl: `https://8x8.vc/${fullRoom}?jwt=${token}`
      }
    });
  } catch (error) {
    console.error('JITSI TOKEN ERROR DETAIL:', error);
    res.status(500).json({ success: false, message: 'Server error', detail: error.message });
  }
});

// @desc Student leaves a session
// @route POST /api/sessions/:id/leave
// @access Private (Student)
const leaveSession = asyncHandler(async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Find student in session
    const studentEntry = session.students.find(s => s.studentId.toString() === req.user.id.toString());
    
    if (studentEntry && studentEntry.logs.length > 0) {
      // Get the last log
      const lastLog = studentEntry.logs[studentEntry.logs.length - 1];
      if (!lastLog.leaveTime) {
        lastLog.leaveTime = new Date();
        await session.save();
      }
    }

    res.status(200).json({ success: true, message: 'Left session successfully' });
  } catch (error) {
    console.error('LEAVE SESSION ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc Get session attendance report
// @route GET /api/sessions/report/:id
// @access Private (Teacher)
const getSessionReport = asyncHandler(async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('teacherId', 'name')
      .populate('classId', 'className section year');

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.status !== 'ENDED') return res.status(400).json({ success: false, message: 'Report is only available for ended sessions' });

    // Fetch all students belonging to the class
    const allStudentsInClass = await User.find({ 
      role: 'student', 
      classId: session.classId._id 
    }).select('name email');

    const totalSeconds = Math.floor((session.endTime - session.startTime) / 1000);
    const totalMins = Math.floor(totalSeconds / 60);
    const totalSecs = totalSeconds % 60;
    const totalDurationFormatted = totalMins > 0 ? `${totalMins} mins ${totalSecs} secs` : `${totalSecs} secs`;

    const reportStudents = allStudentsInClass.map(student => {
      const studentEntry = session.students.find(s => s.studentId.toString() === student._id.toString());
      
      let firstJoinTime = null;
      let lastLeaveTime = null;
      let totalAttendedSeconds = 0;
      let logs = [];

      if (studentEntry && studentEntry.logs.length > 0) {
        const sortedLogs = studentEntry.logs.sort((a, b) => new Date(a.joinTime) - new Date(b.joinTime));
        firstJoinTime = sortedLogs[0].joinTime;
        lastLeaveTime = sortedLogs[sortedLogs.length - 1].leaveTime;

        logs = sortedLogs.map(log => {
          const duration = log.leaveTime ? Math.floor((new Date(log.leaveTime) - new Date(log.joinTime)) / 1000) : 0;
          totalAttendedSeconds += duration;
          return {
            joinTime: log.joinTime,
            leaveTime: log.leaveTime || null
          };
        });
      }

      const attMins = Math.floor(totalAttendedSeconds / 60);
      const attSecs = totalAttendedSeconds % 60;
      const attendedDurationFormatted = totalAttendedSeconds > 0 
        ? (attMins > 0 ? `${attMins} mins ${attSecs} secs` : `${attSecs} secs`)
        : '0 secs';

      return {
        studentName: student.name,
        email: student.email,
        firstJoinTime,
        lastLeaveTime,
        logs,
        logCount: logs.length,
        attendedDuration: attendedDurationFormatted,
        status: totalAttendedSeconds > 0 ? 'Present' : 'Absent'
      };
    });

    res.status(200).json({
      success: true,
      data: {
        subject: session.subject,
        date: session.startTime,
        startTime: session.startTime,
        endTime: session.endTime,
        totalDuration: totalDurationFormatted,
        students: reportStudents
      }
    });
  } catch (error) {
    console.error('REPORT ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = {
  startSession,
  endSession,
  getTeacherHistory,
  getActiveSession,
  getSessionDetails,
  joinSession,
  getJitsiToken,
  leaveSession,
  getSessionReport
};
