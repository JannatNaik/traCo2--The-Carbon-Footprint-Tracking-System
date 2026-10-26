const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
const configuredFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = new Set([
  configuredFrontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser clients (such as health checks) and local Vite origins.
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/emissions', require('./routes/emissions'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/device', require('./routes/device'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/rewards', require('./routes/rewards'));

// Admin routes
app.use('/api/admin/auth', require('./routes/admin-auth'));
app.use('/api/admin/dashboard', require('./routes/admin/dashboard'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/devices', require('./routes/admin/devices'));
app.use('/api/admin/sensor-data', require('./routes/admin/sensor-data'));
app.use('/api/admin/carbon-factors', require('./routes/admin/carbon-factors'));
app.use('/api/admin/rewards', require('./routes/admin/rewards'));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large' });
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
