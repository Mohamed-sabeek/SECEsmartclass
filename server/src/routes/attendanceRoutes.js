const express = require('express');
const router = express.Router();
const { getTeacherAttendanceAnalytics } = require('../controllers/attendanceController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.get('/teacher', protect, teacherOnly, getTeacherAttendanceAnalytics);

module.exports = router;
