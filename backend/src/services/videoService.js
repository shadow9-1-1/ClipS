const Video = require('../models/Video');

const createVideo = async ({ ownerId, title, description, videoURL, duration, status }) => {
  const video = await Video.create({
    owner: ownerId,
    title,
    description: description || '',
    videoURL,
    duration,
    status: status || 'public',
  });

  return {
    id: video._id.toString(),
    title: video.title,
    description: video.description,
    owner: video.owner.toString(),
    videoURL: video.videoURL,
    duration: video.duration,
    viewsCount: video.viewsCount,
    status: video.status,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  };
};

module.exports = {
  createVideo,
};
