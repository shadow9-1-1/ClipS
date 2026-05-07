const express = require('express');

const { getMe, updateMe, getUserProfile, updatePreferences } = require('../controllers/userController');
const { follow, unfollow, followers, following } = require('../controllers/followController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const validateRequest = require('../middleware/validateRequest');
const { updateMeSchema, userIdParamSchema, updatePreferencesSchema } = require('../utils/userSchemas');
const { emptySchema } = require('../utils/commonSchemas');

const router = express.Router();

router.get('/me', asyncHandler(protect), validateRequest(emptySchema), asyncHandler(getMe));
router.patch('/updateMe', asyncHandler(protect), validateRequest(updateMeSchema), asyncHandler(updateMe));
router.patch('/preferences', asyncHandler(protect), validateRequest(updatePreferencesSchema), asyncHandler(updatePreferences));

router.post('/:id/follow', validateRequest(userIdParamSchema), asyncHandler(protect), asyncHandler(follow));
router.delete('/:id/unfollow', validateRequest(userIdParamSchema), asyncHandler(protect), asyncHandler(unfollow));
router.get('/:id/followers', validateRequest(userIdParamSchema), asyncHandler(followers));
router.get('/:id/following', validateRequest(userIdParamSchema), asyncHandler(following));

router.get('/:id', validateRequest(userIdParamSchema), asyncHandler(getUserProfile));

module.exports = router;
