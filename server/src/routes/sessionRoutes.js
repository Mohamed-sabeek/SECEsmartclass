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
  getJitsiToken
} = require('../controllers/sessionController');

router.use(protect);

router.post('/', startSession);
router.post('/join', joinSession);
router.post('/token', getJitsiToken);
router.get('/active', getActiveSession);
router.get('/history', getTeacherHistory);
router.get('/:id', getSessionDetails);
router.patch('/:id/end', endSession);

module.exports = router;
