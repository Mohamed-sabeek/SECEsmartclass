const express = require('express')
const cors = require('cors')

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

  app.use(cors())
  app.use(express.json())

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
  
  // GLOBAL ERROR HANDLER - MUST BE LAST
  app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Something went wrong on the server',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  return app
}

module.exports = { createApp }

