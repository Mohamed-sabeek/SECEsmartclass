const { validationResult } = require('express-validator');

// Standardized validation middleware that checks results and returns 400 if errors exist
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(400).json({
    success: false,
    message: extractedErrors[0][Object.keys(extractedErrors[0])[0]], // Return first error message
    errors: extractedErrors
  });
};

module.exports = { validate };
