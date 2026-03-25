const express = require('express');

const { createVideoHandler } = require('../controllers/videoController');
const { createReview } = require('../controllers/reviewController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const validateRequest = require('../middleware/validateRequest');
const { createVideoSchema } = require('../utils/videoSchemas');
const { createReviewSchema } = require('../utils/reviewSchemas');

const router = express.Router();

router.post('/', asyncHandler(protect), validateRequest(createVideoSchema), asyncHandler(createVideoHandler));
router.post('/:id/reviews', asyncHandler(protect), validateRequest(createReviewSchema), asyncHandler(createReview));

module.exports = router;
