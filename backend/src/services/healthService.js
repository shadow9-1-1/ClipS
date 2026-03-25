const mongoose = require('mongoose');

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const getHealthStatus = () => ({
  status: 'ok',
});

const getAdminHealthStatus = () => ({
  uptime: process.uptime(),
  memoryUsage: process.memoryUsage(),
  dbStatus: DB_STATES[mongoose.connection.readyState] ?? 'unknown',
});

module.exports = {
  getHealthStatus,
  getAdminHealthStatus,
};
