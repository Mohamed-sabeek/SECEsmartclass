const User = require('../models/User')
const { signToken } = require('../services/tokenService')

async function login(req, res) {
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
    },
  })
}

module.exports = { login }

