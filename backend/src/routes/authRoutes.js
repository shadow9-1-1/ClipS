const express = require('express');

const { register, login, getMe } = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { registerSchema, loginSchema } = require('../utils/authSchemas');
const protect = require('../middleware/protect');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), asyncHandler(register));
router.post('/login', validateRequest(loginSchema), asyncHandler(login));
router.get('/me', asyncHandler(protect), asyncHandler(getMe));

module.exports = router;
