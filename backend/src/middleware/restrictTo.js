const restrictTo = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    const err = new Error('Authentication required');
    err.statusCode = 401;
    return next(err);
  }

  if (!allowedRoles.includes(req.user.role)) {
    const err = new Error('Forbidden: insufficient permissions');
    err.statusCode = 403;
    return next(err);
  }

  return next();
};

module.exports = restrictTo;
