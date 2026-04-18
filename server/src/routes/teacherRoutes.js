const express = require('express');
const router = express.Router();
const { protect, teacherOnly } = require('../middleware/authMiddleware');
const { getStudentsByClass } = require('../controllers/userController');

// All routes require authentication and teacher role
router.use(protect);
router.use(teacherOnly);

// @route GET /api/teacher/class/:classId/students
router.get('/class/:classId/students', getStudentsByClass);

module.exports = router;
