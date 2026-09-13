const express = require('express');
const db = require('../../db');
const { verifyAdmin } = require('../../middleware/auth');
const router = express.Router();

router.get('/', verifyAdmin, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const records = db.prepare(
      `SELECT er.*, u.name as user_name
       FROM emission_records er JOIN users u ON er.user_id = u.id
       WHERE er.source = 'hardware'
       ORDER BY er.recorded_at DESC LIMIT ? OFFSET ?`
    ).all(limit, offset);

    const total = db.prepare("SELECT COUNT(*) as cnt FROM emission_records WHERE source = 'hardware'").get().cnt;

    res.json({ page, limit, total, records });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

module.exports = router;
