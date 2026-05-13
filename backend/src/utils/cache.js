const { getRedisClient } = require('../config/redis');

/**
 * Get a cached value by key
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
const get = async (key) => {
  try {
    const redisClient = getRedisClient();
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null; // Fail gracefully
  }
};

/**
 * Set a cached value with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 3600)
 * @returns {Promise<boolean>} - Success status
 */
const set = async (key, value, ttl = 3600) => {
  try {
    const redisClient = getRedisClient();
    const serialized = JSON.stringify(value);
    
    if (ttl) {
      await redisClient.setEx(key, ttl, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
    
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

/**
 * Delete a cached value
 * @param {string} key - Cache key
 * @returns {Promise<number>} - Number of keys deleted
 */
const del = async (key) => {
  try {
    const redisClient = getRedisClient();
    return await redisClient.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
    return 0;
  }
};

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., 'user:*')
 * @returns {Promise<number>} - Number of keys deleted
 */
const delPattern = async (pattern) => {
  try {
    const redisClient = getRedisClient();
    const keys = await redisClient.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    return await redisClient.del(keys);
  } catch (error) {
    console.error('Cache delete pattern error:', error);
    return 0;
  }
};

/**
 * Clear all cache
 * @returns {Promise<void>}
 */
const clear = async () => {
  try {
    const redisClient = getRedisClient();
    await redisClient.flushDb();
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

/**
 * Check if a key exists
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
const exists = async (key) => {
  try {
    const redisClient = getRedisClient();
    const exists = await redisClient.exists(key);
    return exists > 0;
  } catch (error) {
    console.error('Cache exists error:', error);
    return false;
  }
};

/**
 * Set expiration on existing key
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>}
 */
const expire = async (key, ttl) => {
  try {
    const redisClient = getRedisClient();
    const result = await redisClient.expire(key, ttl);
    return result === 1;
  } catch (error) {
    console.error('Cache expire error:', error);
    return false;
  }
};

/**
 * Get TTL of a key in seconds
 * @param {string} key - Cache key
 * @returns {Promise<number>} - TTL in seconds, -1 if no expiry, -2 if key doesn't exist
 */
const ttl = async (key) => {
  try {
    const redisClient = getRedisClient();
    return await redisClient.ttl(key);
  } catch (error) {
    console.error('Cache ttl error:', error);
    return -2;
  }
};

module.exports = {
  get,
  set,
  del,
  delPattern,
  clear,
  exists,
  expire,
  ttl,
};
