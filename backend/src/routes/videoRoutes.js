const express = require('express');

const { create, list, followingFeed, trendingFeed, update, remove } = require('../controllers/videoController');
const { createReview } = require('../controllers/reviewController');
const { like, unlike } = require('../controllers/likeController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const validateRequest = require('../middleware/validateRequest');
const {
	createVideoSchema,
	updateVideoSchema,
	videoIdParamSchema,
	getVideosSchema,
	getFeedSchema,
} = require('../utils/videoSchemas');
const { createReviewSchema } = require('../utils/reviewSchemas');

const router = express.Router();

router.post('/', asyncHandler(protect), validateRequest(createVideoSchema), asyncHandler(create));
router.get('/', validateRequest(getVideosSchema), asyncHandler(list));
router.get('/feed/following', asyncHandler(protect), validateRequest(getFeedSchema), asyncHandler(followingFeed));
router.get('/feed/trending', validateRequest(getFeedSchema), asyncHandler(trendingFeed));
router.post('/:id/reviews', asyncHandler(protect), validateRequest(createReviewSchema), asyncHandler(createReview));
router.post('/:id/likes', asyncHandler(protect), validateRequest(videoIdParamSchema), asyncHandler(like));
router.delete('/:id/likes', asyncHandler(protect), validateRequest(videoIdParamSchema), asyncHandler(unlike));
router.patch('/:id', asyncHandler(protect), validateRequest(updateVideoSchema), asyncHandler(update));
router.delete('/:id', asyncHandler(protect), validateRequest(videoIdParamSchema), asyncHandler(remove));

module.exports = router;
