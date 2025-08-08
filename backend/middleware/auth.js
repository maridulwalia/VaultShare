const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // For file downloads, we might want to allow unauthenticated access for non-login-required files
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        req.user = null;
        return next();
      }

      req.user = user;
      next();
    } catch (tokenError) {
      // Invalid token - set user to null and continue
      req.user = null;
      next();
    }
  } catch (error) {
    req.user = null;
    next();
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };