function notFound(req, res, next) {
  res.status(404)
  next(new Error(`Not found: ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('SERVER ERROR:', err.stack || err.message)
  
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}

module.exports = { notFound, errorHandler }

