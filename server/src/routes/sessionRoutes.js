const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  startSession,
  endSession,
  getTeacherHistory,
  getActiveSession,
  getSessionDetails,
  joinSession,
  getJitsiToken,
  leaveSession,
  getSessionReport,
  exportSessionReportExcel,
  exportSessionReportPDF,
  scheduleSession,
  getUpcomingScheduledSessions,
  deleteScheduledSession
} = require('../controllers/sessionController');

router.use(protect);

router.post('/', startSession);
router.post('/join', joinSession);
router.post('/token', getJitsiToken);
router.post('/:id/leave', leaveSession);
router.get('/active', getActiveSession);
router.get('/history', getTeacherHistory);
router.post('/schedule', scheduleSession);
router.get('/scheduled', getUpcomingScheduledSessions);
router.delete('/scheduled/:id', deleteScheduledSession);
router.get('/report/:id', getSessionReport);
router.get('/report/:id/export/excel', exportSessionReportExcel);
router.get('/report/:id/export/pdf', exportSessionReportPDF);
router.get('/:id', getSessionDetails);
router.patch('/:id/end', endSession);

// Debug Route: Test isolated email sending
router.get('/debug/test-email', async (req, res) => {
  const { sendEmail } = require('../utils/sendEmail');
  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "Diagnostic: SECE SmartClass SMTP Test",
      html: "<h1>SMTP Connectivity Verified</h1><p>If you see this, the Nodemailer configuration is correct and the server can reach Gmail SMTP.</p>"
    });
    res.json({ success: true, message: "Diagnostic email dispatched to " + process.env.EMAIL_USER });
  } catch (err) {
    console.error("DEBUG EMAIL ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
