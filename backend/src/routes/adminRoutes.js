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

const router = express.Router();

router.get('/overview', asyncHandler(protect), restrictTo('admin'), asyncHandler(getAdminOverview));
router.get('/health', asyncHandler(protect), restrictTo('admin'), asyncHandler(getAdminHealth));

// Admin statistics endpoint
router.get('/stats', asyncHandler(protect), restrictTo('admin'), asyncHandler(getStats));

// Update user status endpoint
router.patch(
    '/users/:id/status',
    validateRequest(updateUserStatusSchema),
    asyncHandler(protect),
    restrictTo('admin'),
    asyncHandler(updateUserAccountStatus)
);

// Moderation queue endpoint
router.get('/moderation', asyncHandler(protect), restrictTo('admin'), asyncHandler(getModerationItems));

module.exports = router;