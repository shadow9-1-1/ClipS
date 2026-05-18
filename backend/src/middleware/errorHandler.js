const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Server Error';

  // Log error details in development mode for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      statusCode,
      message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    // In production, only log critical errors
    if (statusCode >= 500) {
      console.error('❌ Critical Error:', {
        statusCode,
        message,
        path: req.path,
        method: req.method,
      });
    }
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
