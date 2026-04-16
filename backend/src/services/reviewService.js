const Review = require('../models/Review');
const Video = require('../models/Video');
const { sendNewCommentNotification } = require('./notificationService');

const createVideoReview = async ({ videoId, userId, rating, comment }) => {
  const video = await Video.findById(videoId).select('_id owner title');

  if (!video) {
    const err = new Error('Video not found');
    err.statusCode = 404;
    throw err;
  }

  const existingReview = await Review.findOne({ user: userId, video: videoId }).lean();

  if (existingReview) {
    const err = new Error('You have already reviewed this video');
    err.statusCode = 409;
    throw err;
  }

  const review = await Review.create({
    rating,
    comment: comment || '',
    user: userId,
    video: videoId,
  });

  if (review.comment) {
    await sendNewCommentNotification({
      recipientId: video.owner,
      commenterId: userId,
      videoTitle: video.title,
      comment: review.comment,
    });
  }

  return {
    id: review._id.toString(),
    rating: review.rating,
    comment: review.comment,
    user: review.user.toString(),
    video: review.video.toString(),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
};

const listVideoReviews = async (videoId) => {
  const reviews = await Review.find({ video: videoId })
    .sort({ createdAt: -1 })
    .populate('user', 'username')
    .lean();

  return reviews.map((r) => ({
    id: r._id.toString(),
    rating: r.rating,
    comment: r.comment,
    username: r.user?.username || 'User',
    createdAt: r.createdAt,
  }));
};

module.exports = {
  createVideoReview,
  listVideoReviews,
};
