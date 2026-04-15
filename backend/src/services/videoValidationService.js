const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const ffprobe = require('ffprobe-static');

ffmpeg.setFfprobePath(ffprobe.path);

const MAX_VIDEO_DURATION_SECONDS = Number(process.env.MAX_VIDEO_DURATION_SECONDS || 300);

const probeDuration = (filePath) =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const duration = Number(metadata?.format?.duration || 0);
      resolve(duration);
    });
  });

const validateVideoDuration = async (file) => {
  if (!file || !file.buffer) {
    const err = new Error('Video file is required');
    err.statusCode = 400;
    throw err;
  }

  const tempFileName = `${Date.now()}-${crypto.randomUUID()}-${file.originalname || 'upload.mp4'}`;
  const tempFilePath = path.join(os.tmpdir(), tempFileName);

  try {
    await fs.writeFile(tempFilePath, file.buffer);
    const duration = await probeDuration(tempFilePath);

    if (!Number.isFinite(duration) || duration <= 0) {
      const err = new Error('Unable to read video duration');
      err.statusCode = 400;
      throw err;
    }

    if (duration > MAX_VIDEO_DURATION_SECONDS) {
      const err = new Error(`Video duration exceeds ${MAX_VIDEO_DURATION_SECONDS} seconds`);
      err.statusCode = 400;
      throw err;
    }

    return {
      duration,
      maxAllowedDuration: MAX_VIDEO_DURATION_SECONDS,
    };
  } catch (err) {
    if (!err.statusCode) {
      const probeErr = new Error('Invalid video file or metadata extraction failed');
      probeErr.statusCode = 400;
      throw probeErr;
    }

    throw err;
  } finally {
    await fs.unlink(tempFilePath).catch(() => {});
  }
};

module.exports = {
  validateVideoDuration,
  MAX_VIDEO_DURATION_SECONDS,
};
