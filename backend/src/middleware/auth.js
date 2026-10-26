const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.scope === 'admin') return res.status(403).json({ error: 'User token required' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Admin token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.scope !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const verifyRefreshToken = (req, res, next) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.refreshUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

module.exports = { verifyToken, verifyAdmin, verifyRefreshToken };
