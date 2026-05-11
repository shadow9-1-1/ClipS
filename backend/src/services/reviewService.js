const Review = require('../models/Review');
const Video = require('../models/Video');
const { sendNewCommentNotification } = require('./notificationService');

const getVideoRatingStats = async (videoId) => {
  const stats = await Review.aggregate([
    { $match: { video: videoId } },
    {
      $group: {
        _id: '$video',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = Number(stats[0]?.avgRating || 0);
  const count = Number(stats[0]?.count || 0);
  return {
    averageRating: Number.isFinite(avg) ? avg : 0,
    ratingCount: Number.isFinite(count) ? count : 0,
  };
};

const createVideoReview = async ({ videoId, userId, rating, comment }) => {
  const video = await Video.findById(videoId).select('_id owner title');

  if (!video) {
    const err = new Error('Video not found');
    err.statusCode = 404;
    throw err;
  }

  const normalizedComment = typeof comment === 'string' ? comment.trim() : '';
  const existingReview = await Review.findOne({ user: userId, video: videoId });
  const hadComment = Boolean(existingReview?.comment);

  let review;
  let created = false;

  if (existingReview) {
    existingReview.rating = rating;
    if (typeof comment !== 'undefined') {
      existingReview.comment = normalizedComment;
    }
    review = await existingReview.save();
  } else {
    try {
      review = await Review.create({
        rating,
        comment: normalizedComment,
        user: userId,
        video: videoId,
      });
      created = true;
    } catch (err) {
      // Handle race condition on unique (user, video) index.
      if (err?.code === 11000) {
        const alreadyCreated = await Review.findOne({ user: userId, video: videoId });
        if (!alreadyCreated) throw err;
        alreadyCreated.rating = rating;
        if (typeof comment !== 'undefined') {
          alreadyCreated.comment = normalizedComment;
        }
        review = await alreadyCreated.save();
      } else {
        throw err;
      }
    }
  }

  if (!hadComment && review.comment) {
    await sendNewCommentNotification({
      recipientId: video.owner,
      commenterId: userId,
      videoTitle: video.title,
      comment: review.comment,
    });
  }

  return {
    created,
    stats: await getVideoRatingStats(video._id),
    review: {
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      user: review.user.toString(),
      video: review.video.toString(),
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    },
  };
};

const listVideoReviews = async (videoId) => {
  const reviews = await Review.find({ video: videoId })
    .sort({ createdAt: -1 })
    .populate('user', 'username')
    .lean();

  return reviews.map((r) => {
    let userId = '';
    if (r.user && typeof r.user === 'object' && !Array.isArray(r.user) && r.user._id) {
      userId = r.user._id.toString();
    } else if (r.user) {
      userId = String(r.user);
    }
    return {
      id: r._id.toString(),
      userId,
      rating: r.rating,
      comment: r.comment,
      username:
        typeof r.user === 'object' && r.user !== null && r.user.username
          ? r.user.username
          : 'User',
      createdAt: r.createdAt,
    };
  });
};

module.exports = {
  createVideoReview,
  listVideoReviews,
};
