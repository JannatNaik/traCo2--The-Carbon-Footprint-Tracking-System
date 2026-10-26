const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, scope: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ accessToken: token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

module.exports = router;
