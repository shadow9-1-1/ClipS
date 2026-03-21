const express = require('express');

const { register, login } = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { registerSchema, loginSchema } = require('../utils/authSchemas');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), asyncHandler(register));
router.post('/login', validateRequest(loginSchema), asyncHandler(login));

module.exports = router;
