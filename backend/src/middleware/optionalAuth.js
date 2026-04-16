const jwt = require('jsonwebtoken');

const User = require('../models/User');

/**
 * Attaches `req.user` when a valid Bearer token is present; otherwise continues without error.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch {
      return next();
    }

    const user = await User.findById(decoded.sub).select('-password');
    if (user && user.active && user.accountStatus === 'active') {
      req.user = user;
    }
    return next();
  } catch {
    return next();
  }
};

module.exports = optionalAuth;
