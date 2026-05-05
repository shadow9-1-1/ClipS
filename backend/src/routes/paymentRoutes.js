const express = require('express');

const { createSession } = require('../controllers/paymentController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const validateRequest = require('../middleware/validateRequest');
const { createSessionSchema } = require('../utils/paymentSchemas');

const router = express.Router();

router.post(
  '/create-session',
  asyncHandler(protect),
  validateRequest(createSessionSchema),
  asyncHandler(createSession)
);

module.exports = router;
