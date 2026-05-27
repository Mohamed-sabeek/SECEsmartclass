const User = require('../models/User');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');
const { Readable } = require('stream');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// @desc Get current user profile
// @route GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'assignedClasses',
        populate: {
          path: 'departmentId',
          select: 'name code'
        }
      })
      .populate('classId', 'className year section');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData = user.toObject();

    // Only compute heavy analytics if explicitly requested via query parameter
    if (user.role === 'teacher' && req.query.analytics === 'true') {
      const sessions = await Session.find({ teacherId: user._id, status: 'ENDED' });
      const sessionCount = sessions.length;
      userData.totalSessions = sessionCount;

      if (sessionCount > 0) {
        let totalPresent = 0;
        let totalExpected = 0;
        const classCountCache = {};

        for (const session of sessions) {
          const cid = session.classId.toString();
          if (!classCountCache[cid]) {
            classCountCache[cid] = await User.countDocuments({ role: 'student', classId: session.classId });
          }
          totalPresent += session.attendanceCount || 0;
          totalExpected += classCountCache[cid] || 0;
        }

        userData.averageAttendance = totalExpected > 0 
          ? parseFloat(((totalPresent / totalExpected) * 100).toFixed(1)) 
          : 0;
      } else {
        userData.averageAttendance = 0;
      }
    }

    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    console.error('GET ME ERROR:', error.message);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add new user (Admin only)
const addUser = async (req, res) => {
  try {
    const { name, email, role, department, classId, rollNo, admissionYear, currentYear, subjects } = req.body;

    // 1. Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }

    // 2. Initial check for existing user (for better UX)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 3. Set default password (plain text, will be hashed by model pre-save hook)
    const defaultPassword = 'Temp@123';

    // 4. Build base userData
    const userData = {
      name,
      email: email.toLowerCase(),
      password: defaultPassword,
      role,
      department: department || '',
      mustChangePassword: true,
    };

    // 5. Add role-based fields ONLY when needed
    if (role === 'student') {
      if (!rollNo || !admissionYear || !currentYear || !classId) {
        return res.status(400).json({ message: 'Student roll number, admission year, current year, and class assignment are required' });
      }
      userData.classId = classId; // Must be present
      userData.studentDetails = { rollNo, admissionYear, currentYear };
    } else if (role === 'teacher') {
      let subjectsArray = [];
      if (Array.isArray(subjects)) {
        subjectsArray = subjects.map(s => s.trim()).filter(s => s !== '');
      } else if (typeof subjects === 'string') {
        subjectsArray = subjects.split(',').map(s => s.trim()).filter(s => s !== '');
      }

      if (subjectsArray.length === 0) {
        return res.status(400).json({ message: 'At least one teacher subject is required' });
      }
      userData.teacherDetails = { subjects: subjectsArray };
    }

    // 6. Create and Save User
    const user = await User.create(userData);

    // 7. Success response
    res.status(201).json({
      message: 'User created successfully',
      defaultPassword: 'Temp@123',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error adding user:', error);
    
    // Handle MongoDB duplicate key error (11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or unique field already exists' });
    }
    
    // Pass the actual message back for debugging
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get user count by role
const getUserCount = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ message: 'Role query parameter is required' });
    }

    const count = await User.countDocuments({ role });

    res.status(200).json({ count });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users (with optional role filter, pagination, and search)
const getAllUsers = async (req, res) => {
  try {
    const { 
      role, 
      departmentId, 
      classId, 
      search, 
      page = 1, 
      limit = 10 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // 1. Build Dynamic Filter
    const filter = {};
    if (role) filter.role = role;
    if (classId) filter.classId = classId;
    if (departmentId) filter.department = departmentId; // department field in User model stores the code

    // 2. Safe Regex Search (name, email, or rollNo)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'studentDetails.rollNo': { $regex: search, $options: 'i' } }
      ];
    }

    // 3. Execute Query with Pagination
    const totalCount = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('classId', 'className year section')
      .populate('assignedClasses', 'className year section')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({ 
      success: true,
      data: users,
      page: pageNum,
      totalPages,
      totalCount
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update user
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, classId, rollNo, admissionYear, currentYear, subjects } = req.body;
    const updateData = { 
      name, 
      email, 
      department,
      classId: classId === "" ? undefined : classId 
    };

    // Find the user first to check role if needed, or just update nested fields
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToUpdate.role === 'student') {
      updateData.studentDetails = { 
        rollNo: rollNo !== undefined ? rollNo : userToUpdate.studentDetails?.rollNo, 
        admissionYear: admissionYear !== undefined ? (Number(admissionYear) || userToUpdate.studentDetails?.admissionYear) : userToUpdate.studentDetails?.admissionYear,
        currentYear: currentYear !== undefined ? (Number(currentYear) || userToUpdate.studentDetails?.currentYear) : userToUpdate.studentDetails?.currentYear
      };
    } else if (userToUpdate.role === 'teacher' && subjects) {
      let subjectsArray = [];
      if (Array.isArray(subjects)) {
        subjectsArray = subjects.map(s => s.trim()).filter(s => s !== '');
      } else if (typeof subjects === 'string') {
        subjectsArray = subjects.split(',').map(s => s.trim()).filter(s => s !== '');
      }
      updateData.teacherDetails = { subjects: subjectsArray };
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    console.error('UPDATE USER ERROR:', error.message);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('DELETE USER ERROR:', error.message);
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Assign teacher to multiple classes with specific subjects
const assignTeacherToClasses = async (req, res) => {
  try {
    const { teacherId, classIds, classAssignments } = req.body;

    // 1. Validate input
    if (!teacherId || (!Array.isArray(classIds) && !Array.isArray(classAssignments))) {
      return res.status(400).json({ message: 'Teacher ID and assignments are required' });
    }

    // 2. Find teacher and validate role
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Assigned user must be a teacher' });
    }

    // 3. Process assignments
    if (classAssignments && Array.isArray(classAssignments)) {
      teacher.classAssignments = classAssignments;
      // Pre-save hook in User model will sync assignedClasses
    } else if (classIds && Array.isArray(classIds)) {
      // Backward compatibility for simple class ID array
      const validClassIds = classIds.filter(id => id && id.trim() !== "");
      teacher.assignedClasses = [...new Set(validClassIds)];
    }
    
    // 4. Double check for invalid classId on the teacher object itself (cleanup)
    if (teacher.classId === "" || teacher.classId === null) {
      teacher.classId = undefined;
    }
    
    await teacher.save();

    res.status(200).json({
      success: true,
      message: 'Classes assigned successfully',
      assignedClasses: teacher.assignedClasses,
      classAssignments: teacher.classAssignments
    });
  } catch (error) {
    console.error('ASSIGN ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Bulk upload users via CSV
const bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const { role = 'student' } = req.body;
    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let added = 0;
        let skipped = 0;
        let errors = [];

        for (const row of results) {
          try {
            const { name, email, rollNo, year, classId } = row;

            // Basic Validation
            if (!name || !email) {
              skipped++;
              continue;
            }

            // Check if user exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
              skipped++;
              continue;
            }

            // Create user
            const defaultPassword = 'Temp@' + Math.random().toString(36).slice(-4);
            
            const userData = {
              name,
              email: email.toLowerCase(),
              password: defaultPassword,
              role,
              department: req.body.department || '' // Optional department from body
            };

            if (role === 'student') {
              userData.classId = classId || undefined;
              userData.studentDetails = {
                rollNo: rollNo || '',
                year: parseInt(year) || 1
              };
            }

            await User.create(userData);
            added++;
          } catch (err) {
            console.error('Row processing error:', err);
            skipped++;
          }
        }

        res.status(200).json({
          success: true,
          message: `Bulk upload complete. Added: ${added}, Skipped: ${skipped}`,
          added,
          skipped
        });
      });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ success: false, message: 'Bulk upload failed', error: error.message });
  }
};

// @desc Get students for a specific class (Teacher only, with assignment check)
// @route GET /api/teacher/class/:classId/students
// @access Private (Teacher)
const getStudentsByClass = asyncHandler(async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;

    // 1. Fetch user to verify role and assignedClasses
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found' });
    }

    // 2. Security Check: Is this class assigned to the teacher?
    const isAssigned = user.assignedClasses && user.assignedClasses.some(id => id.toString() === classId);
    
    if (user.role !== 'admin' && !isAssigned) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You are not assigned to this class.' 
      });
    }

    // 3. Fetch Students for the class
    const students = await User.find({
      role: 'student',
      classId: new mongoose.Types.ObjectId(classId)
    })
    .select('name email studentDetails classId')
    .populate({
      path: 'classId',
      select: 'className year section departmentId',
      populate: {
        path: 'departmentId',
        select: 'name code'
      }
    })
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: students || [],
      count: students.length
    });
  } catch (error) {
    console.error('ROSTER ERROR:', error.message);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error'
    });
  }
});

// @desc Upload/Update profile image to Cloudinary
// @route PUT /api/users/profile/avatar
// @access Private
const uploadProfileImage = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('UPLOAD ERROR: User not found in DB');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!req.file) {
      console.error('UPLOAD ERROR: No file in request');
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Upload to Cloudinary with specific public_id for overwrite
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "sece-smartclass/avatars",
      public_id: `user_${user._id.toString()}`,
      overwrite: true,
      resource_type: "auto"
    });

    // Update user avatar URL with cache busting
    user.avatar = result.secure_url + `?t=${Date.now()}`;
    await user.save();

    // Delete temporary file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({ 
      success: true, 
      message: "Avatar updated successfully",
      avatar: user.avatar 
    });
  } catch (error) {
    console.error('CLOUDINARY UPLOAD ERROR DETAIL:', error);
    // Cleanup temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temp file:', unlinkError);
      }
    }
    res.status(500).json({ 
      success: false, 
      message: 'Cloudinary upload failed', 
      error: error.message,
      detail: error 
    });
  }
});

// Update current user profile (Basic Info)
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};
