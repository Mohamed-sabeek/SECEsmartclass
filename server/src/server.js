const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
console.log('DOTENV LOADED FROM:', path.join(__dirname, '../.env'))
console.log('ENV KEYS:', Object.keys(process.env).filter(k => k.startsWith('JITSI')))

const { createApp } = require('./app')
const { connectDB } = require('./config/db')

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()

  const app = createApp()
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})

