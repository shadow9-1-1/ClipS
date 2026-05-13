const { Queue } = require('bullmq');
const connection = require('../config/queueConnection');

const emailQueue = new Queue('EmailQueue', { connection });
const videoQueue = new Queue('VideoQueue', { connection });

const addEmailJob = async (payload) => {
  try {
    const job = await emailQueue.add('sendEmail', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    return job;
  } catch (error) {
    console.error('Error adding email job to queue', error);
    throw error;
  }
};

const addVideoMetadataJob = async (payload) => {
  try {
    const job = await videoQueue.add('processMetadata', payload, {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    });
    return job;
  } catch (error) {
    console.error('Error adding video job to queue', error);
    throw error;
  }
};

module.exports = {
  emailQueue,
  videoQueue,
  addEmailJob,
  addVideoMetadataJob,
};
