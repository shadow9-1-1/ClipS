const express = require('express');

const { createReview } = require('../controllers/reviewController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const validateRequest = require('../middleware/validateRequest');
const { createReviewSchema } = require('../utils/reviewSchemas');

const router = express.Router();

router.post('/:id/reviews', asyncHandler(protect), validateRequest(createReviewSchema), asyncHandler(createReview));

module.exports = router;
