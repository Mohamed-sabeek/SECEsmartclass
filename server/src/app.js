const express = require('express')
const cors = require('cors')
const path = require('path')

const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const departmentRoutes = require('./routes/departmentRoutes')
const classRoutes = require('./routes/class.routes')
const sessionRoutes = require('./routes/sessionRoutes')
const teacherRoutes = require('./routes/teacherRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')
const studentRoutes = require('./routes/studentRoutes')

function createApp() {
  const app = express()

  // Dynamic CORS Configuration
  const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_URL
  ].filter(Boolean)

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
  }))

  app.use(express.json())
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

  // Root Routes
  app.get('/', (req, res) => {
    res.json({ success: true, message: "API is running 🚀" })
  })
  app.get('/health', (req, res) => res.json({ ok: true }))
  app.get('/api/health', (req, res) => res.json({ status: 'OK' }))

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/departments', departmentRoutes)
  app.use('/api/classes', classRoutes)
  app.use('/api/sessions', sessionRoutes)
  app.use('/api/teacher', teacherRoutes)
  app.use('/api/attendance', attendanceRoutes)
  app.use('/api/student', studentRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}

module.exports = { createApp }

