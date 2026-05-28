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
  getStudentsByClass,
  updateProfile,
  uploadProfileImage
} = require('../controllers/userController');
const upload = require('../middleware/upload');
const csvUpload = require('../middleware/csvUpload');

const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// GET /api/users/me - Get current user profile (Teacher/Student/Admin)
router.get('/me', getMe);

// PUT /api/users/profile - Update current user profile (Name)
router.put('/profile', updateProfile);

// PUT /api/users/profile/avatar - Update current user profile image (Cloudinary)
router.put('/profile/avatar', upload.single('avatar'), uploadProfileImage);

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

// POST /api/users/bulk-upload - Bulk upload users via CSV
router.post('/bulk-upload', csvUpload, bulkUploadUsers);

// POST /api/users/assign-classes - Assign teacher to multiple classes
router.post('/assign-classes', assignTeacherToClasses);

module.exports = router;
