const Session = require('../models/Session');
const User = require('../models/User');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/sendEmail');
const { sessionStartTemplate } = require('../utils/emailTemplates');

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

    // Get teacher's subjects and validate
    const user = await User.findById(req.user.id);
    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject selection is required' });
    }

    if (!user.teacherDetails?.subjects?.includes(subject)) {
      return res.status(400).json({ success: false, message: 'Invalid subject selection for this faculty' });
    }

    console.log("🔥 START SESSION API HIT");
    console.log("Batch ID from request:", classId);
    console.log("Subject:", subject);

    const session = await Session.create({
      teacherId: req.user.id,
      classId,
      subject: subject,
      startTime: new Date(),
      status: 'LIVE',
      sessionCode,
      meetingLink
    });

    console.log("✅ Session Created:", session._id);

    // Send email notifications to students (Async/Non-blocking)
    const sendNotifications = async () => {
      try {
        console.log("🔍 Fetching students for batch:", classId);
        const students = await User.find({ 
          role: 'student', 
          classId: classId 
        }).select('email name');

        console.log("📊 Students found in database:", students.length);
        students.forEach(s => console.log(`📧 Student queue: ${s.email}`));

        if (students.length === 0) {
          console.log("⚠️ No students found for this batch. Skipping emails.");
          return;
        }

        const emailTasks = students
          .filter(s => s.email)
          .map(student => {
            // CRITICAL: Resend Sandbox Mode Override
            // If DEMO_EMAIL is set, ALL emails are forced to that address to avoid "unverified domain" errors.
            const recipient = process.env.DEMO_EMAIL || student.email;
            
            console.log("-----------------------------------------");
            console.log(`📧 Notification Task for: ${student.name}`);
            console.log(`📧 Original Target: ${student.email}`);
            console.log(`📧 Final Recipient (Sandbox Override): ${recipient}`);

            return sendEmail({
              to: recipient,
              subject: `LIVE Class Started: ${subject}`,
              html: sessionStartTemplate({
                subject,
                startTime: new Date(session.startTime).toLocaleString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: true,
                  month: 'short',
                  day: 'numeric'
                }),
                joinUrl: `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/student/live`
              })
            }).then(() => {
              console.log("🌐 URL Configuration:");
              console.log(`🔗 FRONTEND_URL: ${process.env.FRONTEND_URL || 'Not Set'}`);
              console.log(`🔗 Final Join Link: ${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/student/live`);
              console.log(`✅ Success: Notification for ${student.name} dispatched to ${recipient}`);
            }).catch(err => {
              console.error(`❌ Failure: Could not send to ${recipient}:`, err.message);
            });
          });

        await Promise.all(emailTasks);
        console.log(`🏁 Notification sequence complete for session ${session._id}`);
      } catch (err) {
        console.error('🔴 Critical Email notification error:', err.message);
      }
    };

    // Trigger notifications without awaiting
    sendNotifications();

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

    // Sync attendance statuses based on 70% rule
    const totalSessionSeconds = Math.max(Math.floor((session.endTime - session.startTime) / 1000), 1);
    
    for (const studentEntry of session.students) {
      let totalAttendedSeconds = 0;
      studentEntry.logs.forEach(log => {
        if (log.leaveTime) {
          totalAttendedSeconds += Math.floor((new Date(log.leaveTime) - new Date(log.joinTime)) / 1000);
        }
      });

      const percentage = Number(((totalAttendedSeconds / totalSessionSeconds) * 100).toFixed(1));
      const finalStatus = percentage >= 70 ? 'present' : 'absent';

      const attMins = Math.floor(totalAttendedSeconds / 60);
      const attSecs = totalAttendedSeconds % 60;
      const durationStr = totalAttendedSeconds > 0 
        ? (attMins > 0 ? `${attMins} mins ${attSecs} secs` : `${attSecs} secs`)
        : '0 secs';

      await Attendance.findOneAndUpdate(
        { sessionId: session._id, studentId: studentEntry.studentId },
        { 
          status: finalStatus,
          duration: durationStr,
          attendancePercentage: percentage
        },
        { upsert: true }
      );
    }

    // Recalculate attendance count based on students who meet the 70% threshold
    const finalPresentCount = await Attendance.countDocuments({
      sessionId: session._id,
      status: 'present'
    });
    
    session.attendanceCount = finalPresentCount;
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
    const { classId, subject, month, date } = req.query;
    const query = { teacherId: req.user.id };

    if (classId) query.classId = classId;
    if (subject) query.subject = subject;
    
    if (month) {
      const [monthName, year] = month.split(' ');
      const monthIndex = new Date(Date.parse(monthName + " 1, 2024")).getMonth();
      const startOfMonth = new Date(year, monthIndex, 1);
      const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      query.startTime = { $gte: startOfMonth, $lte: endOfMonth };
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const sessions = await Session.find(query)
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

    const totalSessionSeconds = Math.max(Math.floor((session.endTime - session.startTime) / 1000), 1);
    const totalMins = Math.floor(totalSessionSeconds / 60);
    const totalSecs = totalSessionSeconds % 60;
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

      const attendancePercentage = Number(((totalAttendedSeconds / totalSessionSeconds) * 100).toFixed(1));
      const status = attendancePercentage >= 70 ? 'Present' : 'Absent';

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
        attendancePercentage,
        status
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

const PDFDocument = require('pdfkit-table');

// @desc Export session report as CSV
// @route GET /api/sessions/report/:id/export/csv
// @access Private (Teacher)
const exportSessionReportCSV = asyncHandler(async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('classId', 'className section year')
      .populate('teacherId', 'name');

    if (!session || !session.endTime) {
      return res.status(404).json({ success: false, message: 'Session not found or not ended' });
    }

    const allStudentsInClass = await User.find({ 
      role: 'student', 
      classId: session.classId._id 
    }).select('name email');

    const totalSessionSeconds = Math.max(Math.floor((session.endTime - session.startTime) / 1000), 1);
    
    // Header for CSV
    let csvContent = 'Student Name,Email,Join Time,Leave Time,Duration,Percentage,Status\n';

    let presentCount = 0;
    let absentCount = 0;

    allStudentsInClass.forEach(student => {
      const studentEntry = session.students.find(s => s.studentId.toString() === student._id.toString());
      
      let firstJoinStr = '—';
      let lastLeaveStr = '—';
      let totalAttendedSeconds = 0;

      if (studentEntry && studentEntry.logs.length > 0) {
        const sortedLogs = studentEntry.logs.sort((a, b) => new Date(a.joinTime) - new Date(b.joinTime));
        firstJoinStr = new Date(sortedLogs[0].joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        
        const lastLog = sortedLogs[sortedLogs.length - 1];
        if (lastLog.leaveTime) {
          lastLeaveStr = new Date(lastLog.leaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        }

        studentEntry.logs.forEach(log => {
          if (log.leaveTime) {
            totalAttendedSeconds += Math.floor((new Date(log.leaveTime) - new Date(log.joinTime)) / 1000);
          }
        });
      }

      const percentage = Number(((totalAttendedSeconds / totalSessionSeconds) * 100).toFixed(1));
      const status = percentage >= 70 ? 'Present' : 'Absent';
      
      if (status === 'Present') presentCount++;
      else absentCount++;

      const attMins = Math.floor(totalAttendedSeconds / 60);
      const attSecs = totalAttendedSeconds % 60;
      const durationStr = totalAttendedSeconds > 0 
        ? (attMins > 0 ? `${attMins} mins ${attSecs} secs` : `${attSecs} secs`)
        : '0 secs';

      const studentName = `"${student.name.replace(/"/g, '""')}"`;
      csvContent += `${studentName},${student.email},${firstJoinStr},${lastLeaveStr},${durationStr},${percentage}%,${status}\n`;
    });

    // Add summary at the bottom (Strict 2-column format after 1 blank row)
    csvContent += `\n`;
    csvContent += `Summary,\n`;
    csvContent += `Total Students,${allStudentsInClass.length}\n`;
    csvContent += `Present,${presentCount}\n`;
    csvContent += `Absent,${absentCount}\n`;
    csvContent += `Subject,${session.subject}\n`;
    csvContent += `Date,${new Date(session.startTime).toLocaleDateString()}\n`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Report-${session.classId.className}.csv`);
    res.status(200).send(csvContent);

  } catch (error) {
    console.error('CSV EXPORT ERROR:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc Export session report as PDF
// @route GET /api/sessions/report/:id/export/pdf
// @access Private (Teacher)
const exportSessionReportPDF = asyncHandler(async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('classId', 'className section year')
      .populate('teacherId', 'name');

    if (!session || !session.endTime) {
      return res.status(404).json({ success: false, message: 'Session not found or not ended' });
    }

    const allStudentsInClass = await User.find({ 
      role: 'student', 
      classId: session.classId._id 
    }).select('name email');

    const totalSessionSeconds = Math.max(Math.floor((session.endTime - session.startTime) / 1000), 1);
    const totalDurationMins = Math.floor(totalSessionSeconds / 60);
    const totalDurationSecs = totalSessionSeconds % 60;
    const totalDurationStr = totalDurationMins > 0 ? `${totalDurationMins}m ${totalDurationSecs}s` : `${totalDurationSecs}s`;

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Attendance-Report-${session.classId.className}.pdf`);
    doc.pipe(res);

    // Header (Centered)
    doc.fillColor('#1A1A1A').fontSize(22).font('Helvetica-Bold').text('ATTENDANCE REPORT', { align: 'center' });
    doc.moveDown(0.3);
    doc.fillColor('#6B7280').fontSize(11).font('Helvetica').text(`${session.subject} • ${new Date(session.startTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, { align: 'center' });
    doc.moveDown(2);

    // Summary Boxes (Centered in one row)
    const pageWidth = doc.page.width - 80;
    const boxWidth = pageWidth / 3 - 10;
    const summaryY = doc.y;

    let presentCount = 0;
    const studentsData = allStudentsInClass.map(student => {
      const entry = session.students.find(s => s.studentId.toString() === student._id.toString());
      let attendedSecs = 0;
      let firstJoin = '—';
      let lastLeave = '—';

      if (entry && entry.logs.length > 0) {
        const sorted = entry.logs.sort((a, b) => new Date(a.joinTime) - new Date(b.joinTime));
        firstJoin = new Date(sorted[0].joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const lastLog = sorted[sorted.length - 1];
        if (lastLog.leaveTime) {
          lastLeave = new Date(lastLog.leaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        entry.logs.forEach(l => { if (l.leaveTime) attendedSecs += Math.floor((new Date(l.leaveTime) - new Date(l.joinTime)) / 1000); });
      }

      const perc = Number(((attendedSecs / totalSessionSeconds) * 100).toFixed(1));
      const status = perc >= 70 ? 'Present' : 'Absent';
      if (status === 'Present') presentCount++;

      const attMins = Math.floor(attendedSecs / 60);
      const attSecs = attendedSecs % 60;
      const attStr = attendedSecs > 0 ? (attMins > 0 ? `${attMins}m ${attSecs}s` : `${attSecs}s`) : '0s';

      return [student.name, firstJoin, lastLeave, attStr, `${perc}%`, status];
    });

    // Box 1: Total Duration
    doc.rect(40, summaryY, boxWidth, 60).fillAndStroke('#F9FAFB', '#E5E7EB');
    doc.fillColor('#6B7280').fontSize(8).font('Helvetica-Bold').text('TOTAL DURATION', 40, summaryY + 15, { width: boxWidth, align: 'center' });
    doc.fillColor('#1A1A1A').fontSize(14).text(totalDurationStr, 40, summaryY + 30, { width: boxWidth, align: 'center' });

    // Box 2: Students Present
    doc.rect(40 + boxWidth + 15, summaryY, boxWidth, 60).fillAndStroke('#1A1A1A', '#1A1A1A');
    doc.fillColor('#9CA3AF').fontSize(8).text('STUDENTS PRESENT', 40 + boxWidth + 15, summaryY + 15, { width: boxWidth, align: 'center' });
    doc.fillColor('#FFFFFF').fontSize(14).text(`${presentCount}`, 40 + boxWidth + 15, summaryY + 30, { width: boxWidth, align: 'center' });

    // Box 3: Total Students
    doc.rect(40 + (boxWidth + 15) * 2, summaryY, boxWidth, 60).fillAndStroke('#F9FAFB', '#E5E7EB');
    doc.fillColor('#6B7280').fontSize(8).text('TOTAL STUDENTS', 40 + (boxWidth + 15) * 2, summaryY + 15, { width: boxWidth, align: 'center' });
    doc.fillColor('#1A1A1A').fontSize(14).text(`${allStudentsInClass.length}`, 40 + (boxWidth + 15) * 2, summaryY + 30, { width: boxWidth, align: 'center' });

    // Move cursor below the boxes
    doc.y = summaryY + 80;

    // Table Header (Manually positioned for accuracy)
    doc.fillColor('#1A1A1A').fontSize(14).font('Helvetica-Bold').text('Attendance Roster', 40, doc.y);
    doc.fontSize(10).font('Helvetica').text(`Class: ${session.classId.className}`, 40, doc.y);
    doc.moveDown(1);

    // Table (Full width with explicit x position)
    const table = {
      headers: ["Student", "Join", "Leave", "Duration", "%", "Status"],
      rows: studentsData,
    };

    await doc.table(table, {
      x: 40,
      width: pageWidth,
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9).fillColor('#1A1A1A'),
      prepareRow: (row, index, column, rect, rowIndex, columnIndex) => {
        doc.font("Helvetica").fontSize(8).fillColor('#4B5563');
        if (columnIndex === 5) { // Status column
          if (row[5] === 'Present') doc.fillColor('#10B981');
          else doc.fillColor('#EF4444');
        }
      },
    });

    // Footer (Centered Bottom)
    doc.fontSize(8).fillColor('#9CA3AF').text(`Generated by SECE SmartClass • ${new Date().toLocaleString()}`, 0, doc.page.height - 60, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('PDF EXPORT ERROR:', error.message);
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
  getSessionReport,
  exportSessionReportCSV,
  exportSessionReportPDF
};
