const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    hod: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
