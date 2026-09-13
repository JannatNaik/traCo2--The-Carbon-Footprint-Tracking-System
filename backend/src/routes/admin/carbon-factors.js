const express = require('express');
const db = require('../../db');
const { verifyAdmin } = require('../../middleware/auth');
const router = express.Router();

router.get('/', verifyAdmin, (req, res) => {
  try {
    const factors = db.prepare('SELECT * FROM carbon_factors ORDER BY category, fuel_or_source_type').all();
    res.json(factors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch carbon factors' });
  }
});

router.post('/', verifyAdmin, (req, res) => {
  try {
    const { category, fuel_or_source_type, factor_value, unit } = req.body;
    if (!category || !fuel_or_source_type || !factor_value || !unit) {
      return res.status(400).json({ error: 'category, fuel_or_source_type, factor_value, unit required' });
    }
    const result = db.prepare(
      `INSERT INTO carbon_factors (category, fuel_or_source_type, factor_value, unit) VALUES (?, ?, ?, ?)`
    ).run(category, fuel_or_source_type, parseFloat(factor_value), unit);
    res.status(201).json({ id: result.lastInsertRowid, category, fuel_or_source_type, factor_value, unit });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Factor already exists for this category/source' });
    res.status(500).json({ error: 'Failed to create factor' });
  }
});

router.put('/:id', verifyAdmin, (req, res) => {
  try {
    const { factor_value, unit } = req.body;
    if (!factor_value) return res.status(400).json({ error: 'factor_value required' });
    db.prepare(
      `UPDATE carbon_factors SET factor_value = ?, unit = COALESCE(?, unit), updated_at = datetime('now') WHERE id = ?`
    ).run(parseFloat(factor_value), unit, req.params.id);
    const updated = db.prepare('SELECT * FROM carbon_factors WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Factor not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update factor' });
  }
});

router.delete('/:id', verifyAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM carbon_factors WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Factor not found' });
    res.json({ message: 'Carbon factor deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete factor' });
  }
});

module.exports = router;
