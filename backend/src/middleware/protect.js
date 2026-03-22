const jwt = require('jsonwebtoken');

const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      const err = new Error('Authorization token missing');
      err.statusCode = 401;
      return next(err);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      const err = new Error('Authorization token missing');
      err.statusCode = 401;
      return next(err);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      const err = new Error('JWT secret is not configured');
      err.statusCode = 500;
      return next(err);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (verifyError) {
      const err = new Error('Invalid or expired token');
      err.statusCode = 401;
      return next(err);
    }

    const user = await User.findById(decoded.sub).select('-password');

    if (!user || !user.active || user.accountStatus !== 'active') {
      const err = new Error('User not authorized');
      err.statusCode = 401;
      return next(err);
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = protect;
