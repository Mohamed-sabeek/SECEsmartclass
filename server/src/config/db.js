const mongoose = require('mongoose')

async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI is missing in environment variables')

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  console.log('MongoDB connected')
}

module.exports = { connectDB }

