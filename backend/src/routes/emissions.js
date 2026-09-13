const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const { calculateCO2e } = require('../lib/co2Calculator');
const { parsePdfBill } = require('../lib/pdfBillParser');
const { checkAndAwardBadges } = require('../lib/badgeChecker');
const { uploadBill } = require('../middleware/upload');

const router = express.Router();

function insertRecord(userId, category, source, value, unit, co2e_kg) {
  const result = db.prepare(
    'INSERT INTO emission_records (user_id, category, source, value, unit, co2e_kg) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, category, source, value, unit, co2e_kg);
  checkAndAwardBadges(userId, db);
  return result.lastInsertRowid;
}

// POST /api/emissions/electricity
router.post('/electricity', verifyToken, (req, res) => {
  try {
    const { units, energy_source, period_days } = req.body;
    if (!units || !energy_source) return res.status(400).json({ error: 'units and energy_source required' });

    const co2e_kg = calculateCO2e('electricity', energy_source, parseFloat(units), db);
    const id = insertRecord(req.user.id, 'electricity', 'manual', parseFloat(units), 'kWh', co2e_kg);

    res.status(201).json({ id, category: 'electricity', units: parseFloat(units), energy_source, co2e_kg, period_days });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/emissions/electricity/upload — PDF bill via pdf_parser.py
router.post('/electricity/upload', verifyToken, uploadBill.single('bill'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { energy_source } = req.body;
    if (!energy_source) return res.status(400).json({ error: 'energy_source required' });

    const parsed = await parsePdfBill(req.file.path);
    const units = parsed.electricity_units;
    if (!units) return res.status(422).json({ error: 'Could not extract units from PDF' });

    const co2e_kg = calculateCO2e('electricity', energy_source, units, db);
    // The current database schema classifies all user-entered records as `manual`.
    // `extracted_from_pdf` in the response identifies that this record was derived
    // from the uploaded bill while keeping the existing source constraint intact.
    const id = insertRecord(req.user.id, 'electricity', 'manual', units, 'kWh', co2e_kg);

    res.status(201).json({ id, category: 'electricity', units, energy_source, co2e_kg, extracted_from_pdf: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/emissions/transport
// Formula: (distance_km / mileage_kmpl) * factor — matches travel_calc.jsp
router.post('/transport', verifyToken, (req, res) => {
  try {
    let { vehicle_type, fuel_type, distance_km, mileage_kmpl } = req.body;
    if (!fuel_type || !distance_km) return res.status(400).json({ error: 'fuel_type and distance_km required' });

    // Fall back to user profile mileage if not provided
    if (!mileage_kmpl) {
      const profile = db.prepare('SELECT vehicle_mileage_kmpl, fuel_type, vehicle_type FROM user_profile WHERE user_id = ?').get(req.user.id);
      mileage_kmpl = profile?.vehicle_mileage_kmpl || 15;
      if (!fuel_type) fuel_type = profile?.fuel_type || 'petrol';
      if (!vehicle_type) vehicle_type = profile?.vehicle_type || 'Car';
    }

    const liters = parseFloat(distance_km) / parseFloat(mileage_kmpl);
    const co2e_kg = calculateCO2e('transport', fuel_type, liters, db);
    const id = insertRecord(req.user.id, 'transport', 'manual', parseFloat(distance_km), 'km', co2e_kg);

    res.status(201).json({ id, category: 'transport', vehicle_type, fuel_type, distance_km: parseFloat(distance_km), mileage_kmpl: parseFloat(mileage_kmpl), liters_burned: parseFloat(liters.toFixed(2)), co2e_kg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/emissions/food
router.post('/food', verifyToken, (req, res) => {
  try {
    let { diet_type, days } = req.body;
    if (!days) return res.status(400).json({ error: 'days required' });

    if (!diet_type) {
      const profile = db.prepare('SELECT diet_type FROM user_profile WHERE user_id = ?').get(req.user.id);
      diet_type = profile?.diet_type || 'mixed';
    }

    const co2e_kg = calculateCO2e('food', diet_type, parseFloat(days), db);
    const id = insertRecord(req.user.id, 'food', 'manual', parseFloat(days), 'days', co2e_kg);

    res.status(201).json({ id, category: 'food', diet_type, days: parseFloat(days), co2e_kg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/emissions/waste
router.post('/waste', verifyToken, (req, res) => {
  try {
    const { waste_type, quantity_kg } = req.body;
    if (!waste_type || !quantity_kg) return res.status(400).json({ error: 'waste_type and quantity_kg required' });

    const co2e_kg = calculateCO2e('waste', waste_type, parseFloat(quantity_kg), db);
    const id = insertRecord(req.user.id, 'waste', 'manual', parseFloat(quantity_kg), 'kg', co2e_kg);

    res.status(201).json({ id, category: 'waste', waste_type, quantity_kg: parseFloat(quantity_kg), co2e_kg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/emissions/water
router.post('/water', verifyToken, (req, res) => {
  try {
    const { liters, water_type } = req.body;
    if (!liters) return res.status(400).json({ error: 'liters required' });
    const source = water_type || 'tap';
    const co2e_kg = calculateCO2e('water', source, parseFloat(liters), db);
    const id = insertRecord(req.user.id, 'water', 'manual', parseFloat(liters), 'L', co2e_kg);
    res.status(201).json({ id, category: 'water', liters: parseFloat(liters), water_type: source, co2e_kg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/emissions
router.get('/', verifyToken, (req, res) => {
  try {
    const { period = 'month', category } = req.query;
    let dateFilter = "date(recorded_at) >= date('now', '-30 days')";
    if (period === 'today') dateFilter = "date(recorded_at) = date('now')";
    else if (period === 'week') dateFilter = "date(recorded_at) >= date('now', '-7 days')";
    else if (period === 'year') dateFilter = "date(recorded_at) >= date('now', '-365 days')";

    let query = `SELECT * FROM emission_records WHERE user_id = ? AND ${dateFilter}`;
    const params = [req.user.id];
    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY recorded_at DESC';

    const records = db.prepare(query).all(...params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emissions' });
  }
});

module.exports = router;
