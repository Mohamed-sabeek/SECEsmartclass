const express = require('express');
const router = express.Router();
const { protect, adminOnly, teacherOnly } = require('../middleware/authMiddleware');
const {
  addUser,
  getUserCount,
  getAllUsers,
  updateUser,
  deleteUser,
  assignTeacherToClasses,
  bulkUploadUsers,
  getMe,
  getStudentsByClass
} = require('../controllers/userController');

const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// GET /api/users/me - Get current user profile (Teacher/Student/Admin)
router.get('/me', getMe);

// Admin-only routes below this line
router.use(adminOnly);

// Validation rules for adding/updating users
const userValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Enter a valid institutional email').normalizeEmail(),
  body('role').isIn(['admin', 'student', 'teacher']).withMessage('Invalid role assigned'),
  validate
];

// POST /api/users - Add new user
router.post('/', userValidation, addUser);

// GET /api/users/count?role=student - Get user count by role
router.get('/count', getUserCount);

// GET /api/users - Get all users (with optional role filter)
router.get('/', getAllUsers);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/users/bulk-upload - Bulk upload users via CSV
router.post('/bulk-upload', upload.single('file'), bulkUploadUsers);

module.exports = router;
