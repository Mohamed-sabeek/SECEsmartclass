const Department = require('../models/Department');

// Get all departments with dynamic analytics and assigned classes
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 }).lean();
    const Class = require('../models/Class');
    const User = require('../models/User');

    const populatedDepts = await Promise.all(departments.map(async (dept) => {
      // Find all classes assigned to this department
      const classes = await Class.find({ departmentId: dept._id }).sort({ year: 1, className: 1 }).lean();
      const classIds = classes.map(c => c._id);
      
      // Count total students in these classes
      const studentsCount = await User.countDocuments({ role: 'student', classId: { $in: classIds } });
      
      // Get unique years
      const yearsSet = new Set(classes.map(c => c.year));
      const years = Array.from(yearsSet).sort().map(y => {
        if (y === 1) return '1st';
        if (y === 2) return '2nd';
        if (y === 3) return '3rd';
        return `${y}th`;
      });

      return {
        ...dept,
        classes,
        classesCount: classes.length,
        studentsCount,
        years: years.join(', ')
      };
    }));

    res.status(200).json({ departments: populatedDepts });
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get department count
const getDepartmentCount = async (req, res) => {
  try {
    const count = await Department.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error getting department count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add new department
const addDepartment = async (req, res) => {
  try {
    const { name, code, hod, classIds } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: 'Name and code are required' });
    }

    // Check if department code already exists
    const existingDept = await Department.findOne({ code: code.toUpperCase() });
    if (existingDept) {
      return res.status(400).json({ message: 'Department code already exists' });
    }

    const newDepartment = new Department({
      name,
      code: code.toUpperCase(),
      hod: hod || '',
    });

    await newDepartment.save();

    // Automatically update assigned classes' department reference
    if (classIds && Array.isArray(classIds) && classIds.length > 0) {
      const Class = require('../models/Class');
      await Class.updateMany(
        { _id: { $in: classIds } },
        { departmentId: newDepartment._id }
      );
    }

    res.status(201).json({
      message: 'Department created successfully',
      department: newDepartment,
    });
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, hod, classIds } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
      { name, code: code?.toUpperCase(), hod },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Automatically update assigned classes' department reference
    if (classIds && Array.isArray(classIds)) {
      const Class = require('../models/Class');
      
      // First, unset departmentId for any classes previously assigned to this department but now removed
      await Class.updateMany(
        { departmentId: department._id, _id: { $nin: classIds } },
        { $unset: { departmentId: "" } }
      );
      
      // Then, update new classes to belong to this department
      if (classIds.length > 0) {
        await Class.updateMany(
          { _id: { $in: classIds } },
          { departmentId: department._id }
        );
      }
    }

    res.status(200).json({
      message: 'Department updated successfully',
      department,
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // CASCADE PROTECTION: Check if classes exist in this department
    const Class = require('../models/Class');
    const classesCount = await Class.countDocuments({ departmentId: id });
    
    if (classesCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete department. There are ${classesCount} classes assigned to it.`,
        classesCount
      });
    }

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentCount,
  addDepartment,
  updateDepartment,
  deleteDepartment,
};
