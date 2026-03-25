const express = require('express');

const { getAdminOverview, getAdminHealth } = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

router.get('/overview', asyncHandler(protect), restrictTo('admin'), asyncHandler(getAdminOverview));
router.get('/health', asyncHandler(protect), restrictTo('admin'), asyncHandler(getAdminHealth));

module.exports = router;
