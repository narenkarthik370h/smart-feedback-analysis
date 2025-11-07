const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

    let user;
    // ✅ Allow .env admin to bypass DB
    if (decoded.id === 'admin_env_user') {
      user = {
        _id: 'admin_env_user',
        name: 'System Admin',
        email: process.env.ADMIN_EMAIL,
        role: 'admin',
      };
    } else {
      user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ error: 'Access denied. Admin only.' });
};

const isRegistered = (req, res, next) => {
  if (req.user && req.user.role !== 'guest') next();
  else res.status(403).json({ error: 'Access denied. Registered users only.' });
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
      let user;
      if (decoded.id === 'admin_env_user') {
        user = {
          _id: 'admin_env_user',
          name: 'System Admin',
          email: process.env.ADMIN_EMAIL,
          role: 'admin',
        };
      } else {
        user = await User.findById(decoded.id).select('-password');
      }
      if (user) req.user = user;
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, isAdmin, isRegistered, optionalAuth };
