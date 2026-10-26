const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const { getRecommendations } = require('../lib/recommendations');

const router = express.Router();

// GET /api/recommendations
router.get('/', verifyToken, (req, res) => {
  try {
    const periodDays = parseInt(req.query.period_days) || 30;
    const recommendation = getRecommendations(req.user.id, db, periodDays);
    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

module.exports = router;
