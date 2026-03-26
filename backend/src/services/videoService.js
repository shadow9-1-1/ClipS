const Video = require('../models/Video');

const createVideo = async (ownerId, payload) => {
  const video = await Video.create({
    title: payload.title,
    description: payload.description,
    videoURL: payload.videoURL,
    duration: payload.duration,
    status: payload.status,
    owner: ownerId,
  });

  return video;
};

const getVideos = async ({ limit, skip }) => {
  const videos = await Video.find({ status: 'public' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('owner', 'username avatarKey')
    .lean();

  const total = await Video.countDocuments({ status: 'public' });

  return { videos, total };
};

const updateVideo = async (videoId, requesterId, payload) => {
  const video = await Video.findById(videoId);

  if (!video) {
    const err = new Error('Video not found');
    err.statusCode = 404;
    throw err;
  }

  if (video.owner.toString() !== requesterId.toString()) {
    const err = new Error('You are not allowed to update this video');
    err.statusCode = 403;
    throw err;
  }

  if (typeof payload.title !== 'undefined') video.title = payload.title;
  if (typeof payload.description !== 'undefined') video.description = payload.description;

  await video.save();

  return video;
};

const deleteVideo = async (videoId, requesterId, requesterRole) => {
  const video = await Video.findById(videoId);

  if (!video) {
    const err = new Error('Video not found');
    err.statusCode = 404;
    throw err;
  }

  const isOwner = video.owner.toString() === requesterId.toString();
  const isAdmin = requesterRole === 'admin';

  if (!isOwner && !isAdmin) {
    const err = new Error('You are not allowed to delete this video');
    err.statusCode = 403;
    throw err;
  }

  await video.deleteOne();
};

module.exports = {
  createVideo,
  getVideos,
  updateVideo,
  deleteVideo,
};
