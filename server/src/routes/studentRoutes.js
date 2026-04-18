const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getStudentDashboard,
  getStudentAttendance,
  getStudentHistory
} = require('../controllers/studentController');

router.use(protect);

router.get('/dashboard', getStudentDashboard);
router.get('/attendance', getStudentAttendance);
router.get('/history', getStudentHistory);

module.exports = router;
