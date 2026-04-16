const { createVideoReview, listVideoReviews } = require('../services/reviewService');

const createReview = async (req, res) => {
  const review = await createVideoReview({
    videoId: req.params.id,
    userId: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  res.status(201).json({
    status: 'success',
    message: 'Review created successfully',
    data: {
      review,
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
