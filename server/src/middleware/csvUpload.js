const multer = require("multer");
const path = require("path");

// 3. Use memory storage for lightweight CSV files
const storage = multer.memoryStorage();

// 2. Implement CSV file filter with extension check
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".csv") {
    return cb(new Error("Only CSV files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single("file");

// 1. Dedicated middleware wrapper to catch errors and return proper JSON responses
const csvUpload = (req, res, next) => {
  upload(req, res, (err) => {
    // 6. Return proper readable errors (no generic 500s or crashes)
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "CSV upload failed"
      });
    }

    // 7. Validate CSV file existence in the request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required"
      });
    }

    next();
  });
};

module.exports = csvUpload;
