const express = require('express')
const multer = require('multer')

const router = express.Router()

const upload = multer({
  dest: 'uploads/',
})

router.post('/', upload.single('file'), (req, res) => {
  const fs = require('fs')

  const content = fs.readFileSync(req.file.path, 'utf8')

  res.json({
    content,
  })
})

module.exports = router
