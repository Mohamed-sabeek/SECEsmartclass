const Class = require('../models/Class');

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private/Admin
const createClass = async (req, res) => {
  try {
    const { className, departmentId, year, section } = req.body;

    // 1. Validation (Backend)
    if (!className || !departmentId || !year || !section) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Prevent Duplicate Classes (Same name, department, year, and section)
    const existingClass = await Class.findOne({
      className,
      departmentId,
      year,
      section
    });

    if (existingClass) {
      return res.status(400).json({ message: 'Class already exists' });
    }

    // 3. Create Class
    const newClass = await Class.create({
      className,
      departmentId,
      year,
      section
    });

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all classes with populated department and optional filtering
// @route   GET /api/classes
// @access  Private/Admin
const getAllClasses = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const filter = departmentId ? { departmentId } : {};

    const classes = await Class.find(filter)
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true,
      data: classes 
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = async (req, res) => {
  try {
    const { className, departmentId, year, section } = req.body;
    const { id } = req.params;

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { className, departmentId, year, section },
      { new: true, runValidators: true }
    ).populate('departmentId', 'name code');

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json({
      message: 'Class updated successfully',
      class: updatedClass
    });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    
    // CASCADE PROTECTION: Check if students exist in this class
    const User = require('../models/User');
    const studentsCount = await User.countDocuments({ classId: id });
    
    if (studentsCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete class. There are ${studentsCount} students assigned to it.`,
        studentsCount
      });
    }

    const classToDelete = await Class.findByIdAndDelete(id);

    if (!classToDelete) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  createClass,
  getAllClasses,
  updateClass,
  deleteClass
};
