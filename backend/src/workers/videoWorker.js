const { Worker } = require('bullmq');
const connection = require('../config/queueConnection');
const Video = require('../models/Video');

const videoWorker = new Worker('VideoQueue', async (job) => {
  const { videoId, fileKey } = job.data;
  console.log(`Processing video metadata job ${job.id} for video ${videoId}`);

  try {
    // Simulated metadata extraction process (e.g., generating thumbnails or advanced FFprobe analysis)
    // In a real scenario, we might download the file from S3, run ffprobe/ffmpeg, and upload thumbnails.
    
    // Simulate some async processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Example: update video status or add a metadata flag
    // (Assuming we might want to change status from 'processing' to 'public' eventually)
    const video = await Video.findById(videoId);
    if (video) {
      console.log(`Video ${videoId} metadata processed successfully.`);
      // If we had additional fields like 'thumbnailKey' or 'hasMetadata', we'd update them here.
    } else {
      console.warn(`Video ${videoId} not found in database.`);
    }

    return { processed: true, videoId };
  } catch (error) {
    console.error(`Failed to process metadata for video ${videoId}:`, error);
    throw error;
  }
}, { connection });

videoWorker.on('completed', (job) => {
  console.log(`Video metadata job ${job.id} completed successfully`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`Video metadata job ${job.id} failed:`, err.message);
});

module.exports = videoWorker;
