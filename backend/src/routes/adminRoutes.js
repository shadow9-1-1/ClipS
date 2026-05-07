const express = require('express');

const {
    getAdminOverview,
    getAdminHealth,
    getStats,
    updateUserAccountStatus,
    getModerationItems,
} = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const validateRequest = require('../middleware/validateRequest');
const { updateUserStatusSchema } = require('../utils/adminSchemas');
const { emptySchema } = require('../utils/commonSchemas');

const router = express.Router();

router.get(
    '/overview',
    asyncHandler(protect),
    restrictTo('admin'),
    validateRequest(emptySchema),
    asyncHandler(getAdminOverview)
);
router.get(
    '/health',
    asyncHandler(protect),
    restrictTo('admin'),
    validateRequest(emptySchema),
    asyncHandler(getAdminHealth)
);

// Admin statistics endpoint
router.get(
    '/stats',
    asyncHandler(protect),
    restrictTo('admin'),
    validateRequest(emptySchema),
    asyncHandler(getStats)
);

// Update user status endpoint
router.patch(
    '/users/:id/status',
    validateRequest(updateUserStatusSchema),
    asyncHandler(protect),
    restrictTo('admin'),
    asyncHandler(updateUserAccountStatus)
);

// List users
router.get(
    '/users',
    asyncHandler(protect),
    restrictTo('admin'),
    validateRequest(emptySchema),
    asyncHandler((req, res, next) => require('../controllers/adminController').getUsersList(req, res, next))
);

// Get user details
router.get(
    '/users/:id',
    asyncHandler(protect),
    restrictTo('admin'),
    validateRequest(emptySchema),
    asyncHandler((req, res, next) => require('../controllers/adminController').getUserDetails(req, res, next))
);

// Delete user
router.delete(
    '/users/:id',
    asyncHandler(protect),
    restrictTo('admin'),
    validateRequest(emptySchema),
    asyncHandler((req, res, next) => require('../controllers/adminController').removeUser(req, res, next))
);

// Moderation queue endpoint
router.get(
    '/moderation',
    asyncHandler(protect),
    restrictTo('admin'),
    validateRequest(emptySchema),
    asyncHandler(getModerationItems)
);

module.exports = router;