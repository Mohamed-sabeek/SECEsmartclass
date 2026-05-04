const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

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

