const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      index: true 
    },
    password: { 
      type: String, 
      required: true, 
      select: false 
    },
    role: { 
      type: String, 
      enum: ['admin', 'teacher', 'student'], 
      required: true,
      default: 'student' 
    },
    department: { type: String, trim: true },
    classId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Class',
      required: function () {
        return this.role === 'student';
      },
      default: undefined
    },
    assignedClasses: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Class',
      set: v => v === "" || v === null ? undefined : v
    }],
    studentDetails: {
      rollNo: { type: String, trim: true },
      year: { type: Number },
      _id: false
    },
    teacherDetails: {
      subject: { type: String, trim: true },
      _id: false
    },
    mustChangePassword: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Global cleanup: Ensure classIds are never empty strings (prevents CastError)
userSchema.pre('validate', function() {
  if (this.classId === "" || this.classId === null) {
    this.classId = undefined;
  }
  
  if (this.assignedClasses && Array.isArray(this.assignedClasses)) {
    this.assignedClasses = this.assignedClasses.filter(id => id && id !== "");
  }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)

