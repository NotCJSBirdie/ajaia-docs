const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res) => {
  const userId = req.query.userId

  db.all(
    `
      SELECT d.*, 'owned' as access_type
      FROM documents d
      WHERE d.owner_id = ?
  
      UNION
  
      SELECT d.*, 'shared' as access_type
      FROM documents d
      JOIN document_shares ds
        ON ds.document_id = d.id
      WHERE ds.user_id = ?
      `,
    [userId, userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json(rows)
    }
  )
})

router.post('/', (req, res) => {
  const { ownerId, title } = req.body

  db.run(
    `
      INSERT INTO documents (
        owner_id,
        title,
        content_json
      )
      VALUES (?, ?, ?)
      `,
    [ownerId, title, '{}'],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json({
        id: this.lastID,
      })
    }
  )
})

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM documents WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    res.json(row)
  })
})

router.put('/:id', (req, res) => {
  const { title, content_json } = req.body

  db.run(
    `
      UPDATE documents
      SET
        title = ?,
        content_json = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    [title, content_json, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json({
        success: true,
      })
    }
  )
})

router.post('/:id/share', (req, res) => {
  const { userId } = req.body

  db.run(
    `
      INSERT INTO document_shares (
        document_id,
        user_id
      )
      VALUES (?, ?)
      `,
    [req.params.id, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json({
        success: true,
      })
    }
  )
})

module.exports = router
