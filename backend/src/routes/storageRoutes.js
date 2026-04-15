const express = require('express');

const { checkStorageConnection, uploadTestFile } = require('../controllers/storageController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const validateRequest = require('../middleware/validateRequest');
const { uploadTestFileSchema } = require('../utils/storageSchemas');

const router = express.Router();

router.get('/health', asyncHandler(protect), asyncHandler(checkStorageConnection));
router.post('/test-upload', asyncHandler(protect), validateRequest(uploadTestFileSchema), asyncHandler(uploadTestFile));

module.exports = router;
