const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

function getPeriodFilter(period) {
  switch (period) {
    case 'today': return "date(recorded_at) = date('now')";
    case 'week':  return "date(recorded_at) >= date('now', '-7 days')";
    case 'year':  return "date(recorded_at) >= date('now', '-365 days')";
    default:      return "date(recorded_at) >= date('now', '-30 days')";
  }
}

function getTrendPoints(period) {
  switch (period) {
    case 'today': return 24;  // hourly not practical, return 1
    case 'week':  return 7;
    case 'year':  return 12;
    default:      return 30;
  }
}

// GET /api/dashboard?period=week
router.get('/', verifyToken, (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user.id;
    const periodFilter = getPeriodFilter(period);

    // Total CO2e for period
    const totRow = db.prepare(
      `SELECT COALESCE(SUM(co2e_kg), 0) as total FROM emission_records WHERE user_id = ? AND ${periodFilter}`
    ).get(userId);
    const totalCo2e = parseFloat(totRow.total.toFixed(2));

    // Category breakdown
    const categoryRows = db.prepare(
      `SELECT category, COALESCE(SUM(co2e_kg), 0) as total FROM emission_records WHERE user_id = ? AND ${periodFilter} GROUP BY category`
    ).all(userId);
    const byCategory = { electricity: 0, transport: 0, food: 0, waste: 0, water: 0 };
    for (const row of categoryRows) byCategory[row.category] = parseFloat(row.total.toFixed(2));

    // Trend data — daily totals
    let trendDays = period === 'week' ? 7 : period === 'today' ? 1 : period === 'year' ? 365 : 30;
    const trend = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const dateRow = db.prepare(
        `SELECT COALESCE(SUM(co2e_kg), 0) as total FROM emission_records WHERE user_id = ? AND date(recorded_at) = date('now', ?)`
      ).get(userId, `-${i} days`);
      const dateLabel = new Date();
      dateLabel.setDate(dateLabel.getDate() - i);
      trend.push({
        date: dateLabel.toISOString().slice(0, 10),
        co2e: parseFloat(dateRow.total.toFixed(2))
      });
    }

    // Sustainability score: 0-100, lower emissions = higher score
    // Baseline: 200 kg/month for an average individual
    const monthlyEquivalent = period === 'today' ? totalCo2e * 30 :
                              period === 'week'  ? totalCo2e * 4.3 :
                              period === 'year'  ? totalCo2e / 12 : totalCo2e;
    const sustainabilityScore = Math.max(0, Math.round(100 - (monthlyEquivalent / 200) * 100));

    // Recent activity (last 10 records)
    const recentActivity = db.prepare(
      `SELECT id, category, source, value, unit, co2e_kg, recorded_at FROM emission_records WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 10`
    ).all(userId);

    // Badges earned
    const badges = db.prepare(
      `SELECT b.id, b.name, b.description, b.icon, ub.earned_at
       FROM user_badges ub JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = ? ORDER BY ub.earned_at DESC`
    ).all(userId);

    res.json({
      period,
      total_co2e: totalCo2e,
      by_category: byCategory,
      trend,
      sustainability_score: sustainabilityScore,
      recent_activity: recentActivity,
      badges
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;
