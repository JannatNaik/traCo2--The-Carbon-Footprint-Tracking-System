const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { verifyRefreshToken } = require('../middleware/auth');

const router = express.Router();

function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
  return { accessToken, refreshToken };
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hash);
    const userId = result.lastInsertRowid;

    db.prepare('INSERT INTO user_profile (user_id) VALUES (?)').run(userId);

    const payload = { id: userId, email, name };
    const { accessToken, refreshToken } = generateTokens(payload);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ accessToken, user: { id: userId, name, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ error: 'Account deactivated' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { id: user.id, email: user.email, name: user.name };
    const { accessToken, refreshToken } = generateTokens(payload);
    setRefreshCookie(res, refreshToken);

    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, profile_pic_url: user.profile_pic_url } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', verifyRefreshToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, is_active FROM users WHERE id = ?').get(req.refreshUser.id);
    if (!user || !user.is_active) return res.status(403).json({ error: 'Account not found or deactivated' });

    const payload = { id: user.id, email: user.email, name: user.name };
    const { accessToken, refreshToken } = generateTokens(payload);
    setRefreshCookie(res, refreshToken);

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

// POST /api/auth/forgot-password (MVP stub — returns token in response)
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) return res.json({ message: 'If that email is registered, a reset link will be sent' });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, token, expiresAt);

    // MVP: return token directly (no email). In production, send via SMTP.
    res.json({
      message: 'Password reset token generated (MVP: no email sent)',
      reset_token: token,
      note: 'Use POST /api/auth/reset-password with this token'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate reset token' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) return res.status(400).json({ error: 'Token and new_password required' });
    if (new_password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const record = db.prepare(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime('now')"
    ).get(token);
    if (!record) return res.status(400).json({ error: 'Invalid or expired token' });

    const hash = await bcrypt.hash(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, record.user_id);
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(record.id);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
