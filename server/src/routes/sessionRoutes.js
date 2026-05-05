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
  exportSessionReportCSV,
  exportSessionReportPDF
} = require('../controllers/sessionController');

router.use(protect);

router.post('/', startSession);
router.post('/join', joinSession);
router.post('/token', getJitsiToken);
router.post('/:id/leave', leaveSession);
router.get('/active', getActiveSession);
router.get('/history', getTeacherHistory);
router.get('/report/:id', getSessionReport);
router.get('/report/:id/export/csv', exportSessionReportCSV);
router.get('/report/:id/export/pdf', exportSessionReportPDF);
router.get('/:id', getSessionDetails);
router.patch('/:id/end', endSession);

module.exports = router;
