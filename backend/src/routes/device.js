const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/device/register
router.post('/register', verifyToken, (req, res) => {
  try {
    const { device_code, type } = req.body;
    if (!device_code || !type) return res.status(400).json({ error: 'device_code and type required' });
    if (!['electricity', 'gps'].includes(type)) return res.status(400).json({ error: 'type must be electricity or gps' });

    const existing = db.prepare('SELECT id FROM devices WHERE device_code = ?').get(device_code);
    if (existing) return res.status(409).json({ error: 'Device code already registered' });

    const result = db.prepare(
      'INSERT INTO devices (user_id, device_code, type) VALUES (?, ?, ?)'
    ).run(req.user.id, device_code.toUpperCase(), type);

    res.status(201).json({ id: result.lastInsertRowid, device_code: device_code.toUpperCase(), type, status: 'pending' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register device' });
  }
});

// GET /api/device
router.get('/', verifyToken, (req, res) => {
  try {
    const devices = db.prepare(
      'SELECT id, device_code, type, status, last_seen_at, created_at FROM devices WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.user.id);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// DELETE /api/device/:id
router.delete('/:id', verifyToken, (req, res) => {
  try {
    const device = db.prepare('SELECT id FROM devices WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    db.prepare('DELETE FROM devices WHERE id = ?').run(req.params.id);
    res.json({ message: 'Device unlinked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlink device' });
  }
});

// POST /api/device/data — MVP stub (501)
router.post('/data', (req, res) => {
  res.status(501).json({
    error: 'Hardware ingestion not yet implemented',
    message: 'Device data ingestion is planned for v2. The ESP32 firmware can target this endpoint — it will be implemented without breaking changes.',
    status: 'future_scope'
  });
});

module.exports = router;
