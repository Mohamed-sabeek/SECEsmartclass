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
    const { classId } = req.body;

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

    const session = await Session.create({
      teacherId: req.user.id,
      classId,
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

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Verify ownership
    if (session.teacherId.toString() !== req.user.id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    session.endTime = new Date();
    session.status = 'ENDED';
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

    // 2. Check if student already joined
    const existingAttendance = await Attendance.findOne({
      sessionId: session._id,
      studentId
    });

    if (existingAttendance) {
      return res.status(400).json({ success: false, message: 'You have already joined this session' });
    }

    // 3. Mark student as present
    await Attendance.create({
      sessionId: session._id,
      studentId,
      status: 'present'
    });

    // 4. Update session attendance count
    await Session.findByIdAndUpdate(session._id, { $inc: { attendanceCount: 1 } });

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

module.exports = {
  startSession,
  endSession,
  getTeacherHistory,
  getActiveSession,
  getSessionDetails,
  joinSession,
  getJitsiToken
};
