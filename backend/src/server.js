const express = require('express')
const cors = require('cors')

require('./db')

const users = require('./routes/users')
const documents = require('./routes/documents')
const upload = require('./routes/upload')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/users', users)
app.use('/documents', documents)
app.use('/upload', upload)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
