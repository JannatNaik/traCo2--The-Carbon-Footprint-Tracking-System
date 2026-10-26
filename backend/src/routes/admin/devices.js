const express = require('express');
const db = require('../../db');
const { verifyAdmin } = require('../../middleware/auth');
const router = express.Router();

router.get('/', verifyAdmin, (req, res) => {
  try {
    const devices = db.prepare(
      `SELECT d.*, u.name as user_name, u.email as user_email
       FROM devices d LEFT JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC`
    ).all();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.patch('/:id', verifyAdmin, (req, res) => {
  try {
    const { user_id, status } = req.body;
    if (user_id) db.prepare('UPDATE devices SET user_id = ? WHERE id = ?').run(user_id, req.params.id);
    if (status) db.prepare('UPDATE devices SET status = ? WHERE id = ?').run(status, req.params.id);
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update device' });
  }
});

module.exports = router;
