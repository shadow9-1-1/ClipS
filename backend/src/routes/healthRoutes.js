const express = require('express');
const { getHealth } = require('../controllers/healthController');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { emptySchema } = require('../utils/commonSchemas');

const router = express.Router();

router.get('/', validateRequest(emptySchema), asyncHandler(getHealth));

module.exports = router;
