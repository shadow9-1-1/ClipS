const Review = require('../models/Review');
const Video = require('../models/Video');

const createVideoReview = async ({ videoId, userId, rating, comment }) => {
  const video = await Video.findById(videoId).select('_id');

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

module.exports = {
  createVideoReview,
};
