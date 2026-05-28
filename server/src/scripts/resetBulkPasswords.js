require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const User = require('../models/User');

async function run() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Generating hash for default password "Temp@123"...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Temp@123', salt);

    console.log('Finding students who have not changed their password yet...');
    const result = await User.updateMany(
      { role: 'student', mustChangePassword: true },
      { $set: { password: hashedPassword } }
    );

    console.log(`Successfully reset passwords to "Temp@123" for ${result.modifiedCount} student(s) (out of ${result.matchedCount} matched).`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset passwords:', err);
    process.exit(1);
  }
}

run();
