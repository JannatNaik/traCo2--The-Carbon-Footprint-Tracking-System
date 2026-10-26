const express = require('express');
const db = require('../../db');
const { verifyAdmin } = require('../../middleware/auth');
const router = express.Router();

// Badges
router.get('/badges', verifyAdmin, (req, res) => res.json(db.prepare('SELECT * FROM badges').all()));

router.post('/badges', verifyAdmin, (req, res) => {
  try {
    const { name, description, icon, criteria_type, criteria_value } = req.body;
    if (!name || !criteria_type || criteria_value === undefined) return res.status(400).json({ error: 'name, criteria_type, criteria_value required' });
    const result = db.prepare(
      'INSERT INTO badges (name, description, icon, criteria_type, criteria_value) VALUES (?, ?, ?, ?, ?)'
    ).run(name, description, icon, criteria_type, parseFloat(criteria_value));
    res.status(201).json({ id: result.lastInsertRowid, name, description, icon, criteria_type, criteria_value });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create badge' });
  }
});

router.put('/badges/:id', verifyAdmin, (req, res) => {
  try {
    const { name, description, icon, criteria_type, criteria_value } = req.body;
    db.prepare(
      'UPDATE badges SET name = COALESCE(?, name), description = COALESCE(?, description), icon = COALESCE(?, icon), criteria_type = COALESCE(?, criteria_type), criteria_value = COALESCE(?, criteria_value) WHERE id = ?'
    ).run(name, description, icon, criteria_type, criteria_value !== undefined ? parseFloat(criteria_value) : null, req.params.id);
    res.json(db.prepare('SELECT * FROM badges WHERE id = ?').get(req.params.id));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update badge' });
  }
});

router.delete('/badges/:id', verifyAdmin, (req, res) => {
  try {
    const r = db.prepare('DELETE FROM badges WHERE id = ?').run(req.params.id);
    if (r.changes === 0) return res.status(404).json({ error: 'Badge not found' });
    res.json({ message: 'Badge deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete badge' });
  }
});

// Challenges
router.get('/challenges', verifyAdmin, (req, res) => res.json(db.prepare('SELECT * FROM challenges ORDER BY start_date DESC').all()));

router.post('/challenges', verifyAdmin, (req, res) => {
  try {
    const { title, description, start_date, end_date, reward_credits, target_co2e_kg } = req.body;
    if (!title || !target_co2e_kg) return res.status(400).json({ error: 'title and target_co2e_kg required' });
    const result = db.prepare(
      'INSERT INTO challenges (title, description, start_date, end_date, reward_credits, target_co2e_kg) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, description, start_date, end_date, reward_credits || 0, parseFloat(target_co2e_kg));
    res.status(201).json({ id: result.lastInsertRowid, title, description, start_date, end_date, reward_credits, target_co2e_kg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

router.put('/challenges/:id', verifyAdmin, (req, res) => {
  try {
    const { title, description, start_date, end_date, reward_credits, target_co2e_kg } = req.body;
    db.prepare(
      'UPDATE challenges SET title = COALESCE(?, title), description = COALESCE(?, description), start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date), reward_credits = COALESCE(?, reward_credits), target_co2e_kg = COALESCE(?, target_co2e_kg) WHERE id = ?'
    ).run(title, description, start_date, end_date, reward_credits, target_co2e_kg, req.params.id);
    res.json(db.prepare('SELECT * FROM challenges WHERE id = ?').get(req.params.id));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update challenge' });
  }
});

router.delete('/challenges/:id', verifyAdmin, (req, res) => {
  try {
    const r = db.prepare('DELETE FROM challenges WHERE id = ?').run(req.params.id);
    if (r.changes === 0) return res.status(404).json({ error: 'Challenge not found' });
    res.json({ message: 'Challenge deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

module.exports = router;
