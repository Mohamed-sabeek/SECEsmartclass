const User = require('../models/User')
const { signToken } = require('../services/tokenService')
const asyncHandler = require('../utils/asyncHandler')

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password')
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const ok = await user.comparePassword(password)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

  const token = signToken({ id: user._id.toString(), role: user.role })

  return res.json({
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword
    },
  })
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ message: 'Incorrect current password' });
  }

  // Check if new password is the same as current
  const isSame = await user.comparePassword(newPassword);
  if (isSame) {
    return res.status(400).json({ message: 'New password cannot be the same as current password' });
  }

  // Update password and flag
  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

module.exports = { login, changePassword }
