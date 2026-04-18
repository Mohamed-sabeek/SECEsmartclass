const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllDepartments,
  getDepartmentCount,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// GET /api/departments/count - Get department count
router.get('/count', getDepartmentCount);

// GET /api/departments - Get all departments
router.get('/', getAllDepartments);

const deptValidation = [
  body('name').notEmpty().withMessage('Department name is required'),
  body('code').notEmpty().withMessage('Department code is required').isLength({ min: 2, max: 10 }).withMessage('Code should be 2-10 chars'),
  validate
];

// Admin only routes
router.post('/', adminOnly, deptValidation, addDepartment);
router.put('/:id', adminOnly, deptValidation, updateDepartment);
router.delete('/:id', adminOnly, deleteDepartment);

module.exports = router;
