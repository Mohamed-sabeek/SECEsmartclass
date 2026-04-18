require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Seed data
const users = [
  {
    name: 'Admin User',
    email: 'admin@sece.ac.in',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Teacher User',
    email: 'teacher@sece.ac.in',
    password: 'teacher123',
    role: 'teacher'
  },
  {
    name: 'Student User',
    email: 'student@sece.ac.in',
    password: 'student123',
    role: 'student'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is missing in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully\n');

    // Delete existing users
    console.log('🗑️  Deleting existing users...');
    await User.deleteMany({});
    console.log('✅ Old users deleted\n');

    // Hash passwords and create users
    console.log('🔐 Creating new users with hashed passwords...');
    
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    // Insert users into database
    const createdUsers = await User.insertMany(hashedUsers);
    
    console.log('✅ Users created successfully!\n');
    console.log('📋 Login Credentials:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍💼 ADMIN:');
    console.log('   Email:    admin@sece.ac.in');
    console.log('   Password: admin123');
    console.log('   Role:     admin\n');
    
    console.log('👨‍🏫 TEACHER:');
    console.log('   Email:    teacher@sece.ac.in');
    console.log('   Password: teacher123');
    console.log('   Role:     teacher\n');
    
    console.log('👨‍🎓 STUDENT:');
    console.log('   Email:    student@sece.ac.in');
    console.log('   Password: student123');
    console.log('   Role:     student');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`✨ Total users created: ${createdUsers.length}`);
    console.log('🎉 Database seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
