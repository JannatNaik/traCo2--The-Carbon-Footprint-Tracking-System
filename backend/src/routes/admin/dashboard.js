const express = require('express');
const db = require('../../db');
const { verifyAdmin } = require('../../middleware/auth');
const router = express.Router();

router.get('/', verifyAdmin, (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as cnt FROM users').get().cnt;
    const activeUsers = db.prepare('SELECT COUNT(*) as cnt FROM users WHERE is_active = 1').get().cnt;
    const totalDevices = db.prepare('SELECT COUNT(*) as cnt FROM devices').get().cnt;
    const activeDevices = db.prepare("SELECT COUNT(*) as cnt FROM devices WHERE status = 'active'").get().cnt;
    const totalCo2e = db.prepare('SELECT COALESCE(SUM(co2e_kg), 0) as total FROM emission_records').get().total;
    const manualCo2e = db.prepare("SELECT COALESCE(SUM(co2e_kg), 0) as total FROM emission_records WHERE source = 'manual'").get().total;
    const hardwareCo2e = db.prepare("SELECT COALESCE(SUM(co2e_kg), 0) as total FROM emission_records WHERE source = 'hardware'").get().total;

    res.json({
      users: { total: totalUsers, active: activeUsers },
      devices: { total: totalDevices, active: activeDevices },
      emissions: {
        total_co2e: parseFloat(totalCo2e.toFixed(2)),
        manual_co2e: parseFloat(manualCo2e.toFixed(2)),
        hardware_co2e: parseFloat(hardwareCo2e.toFixed(2))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

module.exports = router;
