const express = require('express');

const { getMe, updateMe, getUserProfile, updatePreferences } = require('../controllers/userController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const validateRequest = require('../middleware/validateRequest');
const { updateMeSchema, userIdParamSchema, updatePreferencesSchema } = require('../utils/userSchemas');

const router = express.Router();

router.get('/me', asyncHandler(protect), asyncHandler(getMe));
router.patch('/updateMe', asyncHandler(protect), validateRequest(updateMeSchema), asyncHandler(updateMe));
router.patch('/preferences', asyncHandler(protect), validateRequest(updatePreferencesSchema), asyncHandler(updatePreferences));
router.get('/:id', validateRequest(userIdParamSchema), asyncHandler(getUserProfile));

module.exports = router;
