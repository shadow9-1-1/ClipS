const express = require('express');

const { create, list, update, remove } = require('../controllers/videoController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const validateRequest = require('../middleware/validateRequest');
const { createVideoSchema, updateVideoSchema, videoIdParamSchema, getVideosSchema } = require('../utils/videoSchemas');

const router = express.Router();

router.post('/', asyncHandler(protect), validateRequest(createVideoSchema), asyncHandler(create));
router.get('/', validateRequest(getVideosSchema), asyncHandler(list));
router.patch('/:id', asyncHandler(protect), validateRequest(updateVideoSchema), asyncHandler(update));
router.delete('/:id', asyncHandler(protect), validateRequest(videoIdParamSchema), asyncHandler(remove));

module.exports = router;
