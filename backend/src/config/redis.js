const redis = require('redis');

let redisClient = null;

const initializeRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Max Redis reconnection attempts reached');
            return new Error('Max retries reached');
          }
          return retries * 50;
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Reconnecting to Redis...');
    });

    await redisClient.connect();
    console.log('Redis client initialized successfully');
    
    return redisClient;
  } catch (err) {
    console.error('Failed to initialize Redis:', err);
    throw err;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis first.');
  }
  return redisClient;
};

const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed');
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  closeRedis,
};
