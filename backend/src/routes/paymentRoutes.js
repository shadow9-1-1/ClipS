const express = require('express');

const { createSession, getBalance } = require('../controllers/paymentController');
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

router.get('/balance', asyncHandler(protect), asyncHandler(getBalance));

module.exports = router;
