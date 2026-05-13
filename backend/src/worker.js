const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { initializeRedis } = require('./config/redis');

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection in worker', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception in worker', err);
});

const startWorker = async () => {
  try {
    await connectDB();
    await initializeRedis();
    require('./workers'); // Initialize BullMQ workers
    
    console.log('Worker service started successfully.');
  } catch (err) {
    console.error('Failed to start worker service', err);
    process.exit(1);
  }
};

startWorker();
