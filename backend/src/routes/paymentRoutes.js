const express = require('express');

const { createSession, getBalance } = require('../controllers/paymentController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const validateRequest = require('../middleware/validateRequest');
const { createSessionSchema } = require('../utils/paymentSchemas');
const { emptySchema } = require('../utils/commonSchemas');

const router = express.Router();

router.post(
  '/create-session',
  asyncHandler(protect),
  validateRequest(createSessionSchema),
  asyncHandler(createSession)
);

router.get('/balance', asyncHandler(protect), validateRequest(emptySchema), asyncHandler(getBalance));

module.exports = router;
