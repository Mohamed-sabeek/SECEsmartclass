const Department = require('../models/Department');

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({ departments });
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
    const { name, code, hod } = req.body;

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
    const { name, code, hod } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
      { name, code: code?.toUpperCase(), hod },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
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
