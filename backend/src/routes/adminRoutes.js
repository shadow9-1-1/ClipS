const express = require('express');

const { getAdminOverview } = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

router.get('/overview', asyncHandler(protect), restrictTo('admin'), asyncHandler(getAdminOverview));

module.exports = router;
