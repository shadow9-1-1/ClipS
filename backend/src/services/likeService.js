const Video = require('../models/Video');
const VideoLike = require('../models/VideoLike');
const { sendNewLikeNotification } = require('./notificationService');
const { getSocketServer } = require('../sockets');

// Like weight in trending score formula: Likes × 10
const LIKE_SCORE_WEIGHT = 10;

const likeVideo = async ({ videoId, userId, likerUsername }) => {
  const video = await Video.findById(videoId).select('_id owner title');

  if (!video) {
    const err = new Error('Video not found');
    err.statusCode = 404;
    throw err;
  }

  try {
    const like = await VideoLike.create({
      user: userId,
      video: videoId,
    });

    // Increment trending score by LIKE_SCORE_WEIGHT (10) when like is added
    await Video.findByIdAndUpdate(
      videoId,
      { $inc: { trendingScore: LIKE_SCORE_WEIGHT } },
      { new: true }
    );

    await sendNewLikeNotification({
      recipientId: video.owner,
      likerId: userId,
      videoTitle: video.title,
    });

    const io = getSocketServer();
    const ownerId = video.owner?.toString();
    const likerId = userId?.toString();
    if (io && ownerId && ownerId !== likerId && likerUsername) {
      io.to(ownerId).emit('new-like', {
        likerUsername,
        videoTitle: video.title,
      });
    }

    return {
      id: like._id.toString(),
      user: like.user.toString(),
      video: like.video.toString(),
      createdAt: like.createdAt,
    };
  } catch (err) {
    if (err.code === 11000) {
      const duplicate = new Error('You have already liked this video');
      duplicate.statusCode = 409;
      throw duplicate;
    }

    throw err;
  }
};

const unlikeVideo = async ({ videoId, userId }) => {
  const like = await VideoLike.findOneAndDelete({
    user: userId,
    video: videoId,
  });

  // Decrement trending score by LIKE_SCORE_WEIGHT (10) when like is removed
  if (like) {
    await Video.findByIdAndUpdate(
      videoId,
      { $inc: { trendingScore: -LIKE_SCORE_WEIGHT } },
      { new: true }
    );
  }

  return Boolean(like);
};

const getVideoEngagement = async (videoId, userId) => {
  const likesCount = await VideoLike.countDocuments({ video: videoId });
  let liked = false;
  if (userId) {
    const existing = await VideoLike.findOne({
      video: videoId,
      user: userId,
    }).lean();
    liked = Boolean(existing);
  }
  return { likesCount, liked };
};

const getLikedVideoIdsByUser = async (userId) => {
  const rows = await VideoLike.find({ user: userId }).select('video').lean();
  return rows.map((row) => row.video.toString());
};

module.exports = {
  likeVideo,
  unlikeVideo,
  getVideoEngagement,
  getLikedVideoIdsByUser,
};
