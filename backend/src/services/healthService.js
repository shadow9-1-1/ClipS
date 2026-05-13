const mongoose = require('mongoose');
const { getRedisClient } = require('../config/redis');

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

const getAdminHealthStatus = async () => {
  const { rss, heapUsed, heapTotal } = process.memoryUsage();
  
  let redisStatus = 'unknown';
  try {
    const redisClient = getRedisClient();
    await redisClient.ping();
    redisStatus = 'connected';
  } catch (error) {
    redisStatus = 'disconnected';
  }

  return {
    uptime: process.uptime(),
    memoryUsage: { rss, heapUsed, heapTotal },
    dbStatus: DB_STATES[mongoose.connection.readyState] ?? 'unknown',
    redisStatus,
  };
};

module.exports = {
  getHealthStatus,
  getAdminHealthStatus,
};
