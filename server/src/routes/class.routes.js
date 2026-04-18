const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createClass,
  getAllClasses,
  updateClass,
  deleteClass
} = require('../controllers/class.controller');

// 9. Route Protection (Admin only)
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

router.use(protect);
router.use(adminOnly);

const classValidation = [
  body('className').notEmpty().withMessage('Class name is required'),
  body('departmentId').isMongoId().withMessage('Valid Department ID is required'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('section').notEmpty().withMessage('Section is required'),
  validate
];

router.post('/', classValidation, createClass);
router.put('/:id', classValidation, updateClass);

// GET /api/classes - Get all classes
router.get('/', getAllClasses);


// DELETE /api/classes/:id - Delete class
router.delete('/:id', deleteClass);

module.exports = router;
