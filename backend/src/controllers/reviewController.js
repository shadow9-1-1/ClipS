const { createVideoReview } = require('../services/reviewService');

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

module.exports = {
  createReview,
};
