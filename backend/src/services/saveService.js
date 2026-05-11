const Video = require('../models/Video');
const VideoSave = require('../models/VideoSave');

const saveVideo = async ({ videoId, userId }) => {
  const video = await Video.findById(videoId).select('_id');
  if (!video) {
    const err = new Error('Video not found');
    err.statusCode = 404;
    throw err;
  }

  try {
    const save = await VideoSave.create({
      user: userId,
      video: videoId,
    });

    return {
      id: save._id.toString(),
      user: save.user.toString(),
      video: save.video.toString(),
      createdAt: save.createdAt,
    };
  } catch (err) {
    if (err.code === 11000) {
      const duplicate = new Error('Video already saved');
      duplicate.statusCode = 409;
      throw duplicate;
    }
    throw err;
  }
};

const unsaveVideo = async ({ videoId, userId }) => {
  const save = await VideoSave.findOneAndDelete({
    user: userId,
    video: videoId,
  });
  return Boolean(save);
};

const getSavedVideoIdsByUser = async (userId) => {
  const rows = await VideoSave.find({ user: userId }).select('video').lean();
  return rows.map((row) => row.video.toString());
};

module.exports = {
  saveVideo,
  unsaveVideo,
  getSavedVideoIdsByUser,
};
