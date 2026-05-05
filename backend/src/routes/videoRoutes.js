const express = require('express');

const { create, list, getById, followingFeed, trendingFeed, uploadBinary, update, remove } = require('../controllers/videoController');
const { createReview, listReviews } = require('../controllers/reviewController');
const { like, unlike, getEngagement } = require('../controllers/likeController');
const optionalAuth = require('../middleware/optionalAuth');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const { handleVideoUpload } = require('../middleware/uploadVideo');
const validateRequest = require('../middleware/validateRequest');
const { uploadLimiter } = require('../middleware/rateLimiters');
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
router.post(
	'/upload',
	asyncHandler(protect),
	uploadLimiter,
	handleVideoUpload('video'),
	asyncHandler(uploadBinary)
);
router.get('/', validateRequest(getVideosSchema), asyncHandler(list));
router.get('/feed/following', asyncHandler(protect), validateRequest(getFeedSchema), asyncHandler(followingFeed));
router.get('/feed/trending', validateRequest(getFeedSchema), asyncHandler(trendingFeed));
router.get('/:id/engagement', optionalAuth, validateRequest(videoIdParamSchema), asyncHandler(getEngagement));
router.get('/:id/reviews', validateRequest(videoIdParamSchema), asyncHandler(listReviews));
router.get('/:id', validateRequest(videoIdParamSchema), asyncHandler(getById));
router.post('/:id/reviews', asyncHandler(protect), validateRequest(createReviewSchema), asyncHandler(createReview));
router.post('/:id/likes', asyncHandler(protect), validateRequest(videoIdParamSchema), asyncHandler(like));
router.delete('/:id/likes', asyncHandler(protect), validateRequest(videoIdParamSchema), asyncHandler(unlike));
router.patch('/:id', asyncHandler(protect), validateRequest(updateVideoSchema), asyncHandler(update));
router.delete('/:id', asyncHandler(protect), validateRequest(videoIdParamSchema), asyncHandler(remove));

module.exports = router;
