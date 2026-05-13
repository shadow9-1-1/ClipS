const { Worker } = require('bullmq');
const connection = require('../config/queueConnection');
const { sendEmail } = require('../services/emailService');

const emailWorker = new Worker('EmailQueue', async (job) => {
  console.log(`Processing email job ${job.id} for ${job.data.to}`);
  
  const result = await sendEmail(job.data);
  
  if (!result.sent) {
    if (result.reason === 'smtp_not_configured') {
      console.warn(`Email job ${job.id} skipped: SMTP not configured.`);
      return result;
    }
    throw new Error(`Email sending failed: ${result.reason}`);
  }
  
  return result;
}, { connection });

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed:`, err.message);
});

module.exports = emailWorker;
