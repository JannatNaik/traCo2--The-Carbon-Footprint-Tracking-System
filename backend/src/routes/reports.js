const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

function getDateRange(period, start, end) {
  if (start && end) return { start, end };
  const now = new Date();
  const endDate = now.toISOString().slice(0, 10);
  let startDate;
  switch (period) {
    case 'daily':   startDate = endDate; break;
    case 'weekly':  { const d = new Date(now); d.setDate(d.getDate()-7);  startDate = d.toISOString().slice(0,10); break; }
    case 'yearly':  { const d = new Date(now); d.setFullYear(d.getFullYear()-1); startDate = d.toISOString().slice(0,10); break; }
    default:        { const d = new Date(now); d.setDate(d.getDate()-30); startDate = d.toISOString().slice(0,10); break; }
  }
  return { start: startDate, end: endDate };
}

// GET /api/reports
router.get('/', verifyToken, (req, res) => {
  try {
    const { period = 'monthly', start, end } = req.query;
    const { start: startDate, end: endDate } = getDateRange(period, start, end);
    const userId = req.user.id;

    const records = db.prepare(
      `SELECT * FROM emission_records WHERE user_id = ? AND date(recorded_at) BETWEEN ? AND ? ORDER BY recorded_at DESC`
    ).all(userId, startDate, endDate);

    const byCategory = {};
    const bySource = { manual: 0, hardware: 0 };
    let totalCo2e = 0;

    for (const r of records) {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.co2e_kg;
      bySource[r.source] = (bySource[r.source] || 0) + r.co2e_kg;
      totalCo2e += r.co2e_kg;
    }

    Object.keys(byCategory).forEach(k => { byCategory[k] = parseFloat(byCategory[k].toFixed(2)); });
    Object.keys(bySource).forEach(k => { bySource[k] = parseFloat(bySource[k].toFixed(2)); });

    res.json({
      period, start: startDate, end: endDate,
      total_co2e: parseFloat(totalCo2e.toFixed(2)),
      by_category: byCategory,
      by_source: bySource,
      records
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// GET /api/reports/export/csv
router.get('/export/csv', verifyToken, (req, res) => {
  try {
    const { period = 'monthly', start, end } = req.query;
    const { start: startDate, end: endDate } = getDateRange(period, start, end);

    const records = db.prepare(
      `SELECT recorded_at, category, source, value, unit, co2e_kg FROM emission_records
       WHERE user_id = ? AND date(recorded_at) BETWEEN ? AND ? ORDER BY recorded_at DESC`
    ).all(req.user.id, startDate, endDate);

    const headers = 'date,category,source,value,unit,co2e_kg\n';
    const rows = records.map(r =>
      `${r.recorded_at},${r.category},${r.source},${r.value},${r.unit},${r.co2e_kg}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=traco2_report_${startDate}_${endDate}.csv`);
    res.send(headers + rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
