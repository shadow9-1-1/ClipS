const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Do not count high-frequency media/read endpoints against the generic API budget.
    if (req.method !== 'GET') return false;
    return (
      req.path.startsWith('/storage/access') ||
      req.path.startsWith('/videos/feed/') ||
      req.path === '/users/me' ||
      req.path === '/users/me/liked-videos' ||
      req.path === '/users/me/saved-videos' ||
      /^\/users\/[^/]+$/.test(req.path) ||
      /^\/users\/[^/]+\/(followers|following)$/.test(req.path)
    );
  },
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many uploads, please try again later.',
  },
});

module.exports = {
  apiLimiter,
  uploadLimiter,
};
