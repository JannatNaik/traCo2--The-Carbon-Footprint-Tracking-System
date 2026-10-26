const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/rewards/badges
router.get('/badges', verifyToken, (req, res) => {
  try {
    const allBadges = db.prepare('SELECT * FROM badges').all();
    const earned = db.prepare('SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?').all(req.user.id);
    const earnedMap = {};
    for (const e of earned) earnedMap[e.badge_id] = e.earned_at;

    const badges = allBadges.map(b => ({
      ...b,
      earned: !!earnedMap[b.id],
      earned_at: earnedMap[b.id] || null
    }));
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// GET /api/rewards/credits
router.get('/credits', verifyToken, (req, res) => {
  try {
    const row = db.prepare(
      `SELECT COALESCE(SUM(c.reward_credits), 0) as total
       FROM user_challenges uc JOIN challenges c ON uc.challenge_id = c.id
       WHERE uc.user_id = ? AND uc.completed = 1`
    ).get(req.user.id);
    res.json({ credits: row.total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

// GET /api/rewards/challenges
router.get('/challenges', verifyToken, (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date().toISOString().slice(0, 10);

    // Get all active challenges
    const challenges = db.prepare(
      `SELECT * FROM challenges WHERE end_date >= ? ORDER BY end_date ASC`
    ).all(now);

    const result = challenges.map(ch => {
      // Auto-calculate progress from emission_records
      const progressRow = db.prepare(
        `SELECT COALESCE(SUM(co2e_kg), 0) as total FROM emission_records
         WHERE user_id = ? AND date(recorded_at) BETWEEN ? AND ?`
      ).get(userId, ch.start_date || '2000-01-01', ch.end_date || now);

      const progress = parseFloat(progressRow.total.toFixed(2));
      const completed = progress <= ch.target_co2e_kg && progress > 0 ? 1 : 0;

      // Upsert user_challenges
      db.prepare(
        `INSERT INTO user_challenges (user_id, challenge_id, progress, completed)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, challenge_id) DO UPDATE SET progress = excluded.progress, completed = excluded.completed`
      ).run(userId, ch.id, progress, completed);

      return { ...ch, user_progress: progress, completed: !!completed };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

module.exports = router;
