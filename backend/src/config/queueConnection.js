const { Redis } = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  console.error('BullMQ Redis Connection Error:', err);
});

connection.on('connect', () => {
  console.log('✅ BullMQ connected to Redis');
});

module.exports = connection;
