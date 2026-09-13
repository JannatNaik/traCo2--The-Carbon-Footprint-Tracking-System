const express = require('express');
const path = require('path');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

const router = express.Router();

// GET /api/user/profile
router.get('/profile', verifyToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, profile_pic_url, created_at FROM users WHERE id = ?').get(req.user.id);
    const profile = db.prepare('SELECT * FROM user_profile WHERE user_id = ?').get(req.user.id);
    res.json({ ...user, profile: profile || {} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', verifyToken, (req, res) => {
  try {
    const { name, vehicle_type, fuel_type, vehicle_mileage_kmpl, electricity_meter_type, kwh_per_unit, diet_type, location } = req.body;

    if (name) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.id);
    }

    db.prepare(`
      INSERT INTO user_profile (user_id, vehicle_type, fuel_type, vehicle_mileage_kmpl, electricity_meter_type, kwh_per_unit, diet_type, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        vehicle_type = excluded.vehicle_type,
        fuel_type = excluded.fuel_type,
        vehicle_mileage_kmpl = excluded.vehicle_mileage_kmpl,
        electricity_meter_type = excluded.electricity_meter_type,
        kwh_per_unit = excluded.kwh_per_unit,
        diet_type = excluded.diet_type,
        location = excluded.location
    `).run(req.user.id, vehicle_type, fuel_type, vehicle_mileage_kmpl, electricity_meter_type, kwh_per_unit, diet_type, location);

    const user = db.prepare('SELECT id, name, email, profile_pic_url FROM users WHERE id = ?').get(req.user.id);
    const profile = db.prepare('SELECT * FROM user_profile WHERE user_id = ?').get(req.user.id);
    res.json({ ...user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/user/profile/avatar
router.post('/profile/avatar', verifyToken, uploadAvatar.single('avatar'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/avatars/${req.file.filename}`;
    db.prepare('UPDATE users SET profile_pic_url = ? WHERE id = ?').run(url, req.user.id);
    res.json({ profile_pic_url: url });
  } catch (err) {
    res.status(500).json({ error: 'Avatar upload failed' });
  }
});

module.exports = router;
