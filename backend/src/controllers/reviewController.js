const { createVideoReview, listVideoReviews } = require('../services/reviewService');

const createReview = async (req, res) => {
  const result = await createVideoReview({
    videoId: req.params.id,
    userId: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  res.status(result.created ? 201 : 200).json({
    status: 'success',
    message: result.created ? 'Review created successfully' : 'Review updated successfully',
    data: {
      review: result.review,
      averageRating: result.stats.averageRating,
      ratingCount: result.stats.ratingCount,
    },
  });
};

const listReviews = async (req, res) => {
  const reviews = await listVideoReviews(req.params.id);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
};

module.exports = {
  createReview,
  listReviews,
};
