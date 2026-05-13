const { getRedisClient } = require('../config/redis');

/**
 * Add item to a queue
 * @param {string} queueName - Queue name
 * @param {any} data - Data to queue
 * @returns {Promise<number>} - Queue length
 */
const enqueue = async (queueName, data) => {
  try {
    const redisClient = getRedisClient();
    const serialized = JSON.stringify(data);
    return await redisClient.rPush(queueName, serialized);
  } catch (error) {
    console.error('Queue enqueue error:', error);
    throw error;
  }
};

/**
 * Process items from a queue
 * @param {string} queueName - Queue name
 * @returns {Promise<any>} - Dequeued data or null
 */
const dequeue = async (queueName) => {
  try {
    const redisClient = getRedisClient();
    const item = await redisClient.lPop(queueName);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Queue dequeue error:', error);
    return null;
  }
};

/**
 * Get queue length
 * @param {string} queueName - Queue name
 * @returns {Promise<number>} - Number of items in queue
 */
const getQueueLength = async (queueName) => {
  try {
    const redisClient = getRedisClient();
    return await redisClient.lLen(queueName);
  } catch (error) {
    console.error('Queue length error:', error);
    return 0;
  }
};

/**
 * Get all items from queue without removing
 * @param {string} queueName - Queue name
 * @param {number} start - Start index (default: 0)
 * @param {number} stop - Stop index (default: -1 for all)
 * @returns {Promise<any[]>} - Array of items
 */
const getQueueItems = async (queueName, start = 0, stop = -1) => {
  try {
    const redisClient = getRedisClient();
    const items = await redisClient.lRange(queueName, start, stop);
    return items.map((item) => JSON.parse(item));
  } catch (error) {
    console.error('Queue items error:', error);
    return [];
  }
};

/**
 * Clear queue
 * @param {string} queueName - Queue name
 * @returns {Promise<void>}
 */
const clearQueue = async (queueName) => {
  try {
    const redisClient = getRedisClient();
    await redisClient.del(queueName);
  } catch (error) {
    console.error('Queue clear error:', error);
  }
};

module.exports = {
  enqueue,
  dequeue,
  getQueueLength,
  getQueueItems,
  clearQueue,
};
