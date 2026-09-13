const express = require('express');
const db = require('../../db');
const { verifyAdmin } = require('../../middleware/auth');
const router = express.Router();

router.get('/', verifyAdmin, (req, res) => {
  try {
    const users = db.prepare(
      `SELECT u.id, u.name, u.email, u.is_active, u.created_at,
              COALESCE(SUM(er.co2e_kg), 0) as total_co2e,
              COUNT(er.id) as record_count
       FROM users u LEFT JOIN emission_records er ON u.id = er.user_id
       GROUP BY u.id ORDER BY u.created_at DESC`
    ).all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', verifyAdmin, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, is_active, profile_pic_url, created_at FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const profile = db.prepare('SELECT * FROM user_profile WHERE user_id = ?').get(req.params.id);
    const records = db.prepare('SELECT * FROM emission_records WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 50').all(req.params.id);
    res.json({ ...user, profile, recent_records: records });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.patch('/:id/status', verifyAdmin, (req, res) => {
  try {
    const { is_active } = req.body;
    if (is_active === undefined) return res.status(400).json({ error: 'is_active required' });
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
    res.json({ message: `User ${is_active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;
