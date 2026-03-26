const mongoose = require('mongoose');

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const getHealthStatus = () => ({
  status: 'Ok',
  timestamp: new Date().toISOString(),
});

const getAdminHealthStatus = () => {
  const { rss, heapUsed, heapTotal } = process.memoryUsage();

  return {
    uptime: process.uptime(),
    memoryUsage: { rss, heapUsed, heapTotal },
    dbStatus: DB_STATES[mongoose.connection.readyState] ?? 'unknown',
  };
};

module.exports = {
  getHealthStatus,
  getAdminHealthStatus,
};
