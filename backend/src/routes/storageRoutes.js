const express = require('express');

const {
	checkStorageConnection,
	uploadTestFile,
	createTemporaryUrl,
	accessObjectViaTemporaryUrl,
} = require('../controllers/storageController');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/protect');
const validateRequest = require('../middleware/validateRequest');
const { uploadTestFileSchema, createTemporaryUrlSchema, accessObjectSchema } = require('../utils/storageSchemas');

const router = express.Router();

router.get('/health', asyncHandler(protect), asyncHandler(checkStorageConnection));
router.post('/test-upload', asyncHandler(protect), validateRequest(uploadTestFileSchema), asyncHandler(uploadTestFile));
router.post('/presigned-url', asyncHandler(protect), validateRequest(createTemporaryUrlSchema), asyncHandler(createTemporaryUrl));
router.get('/access', validateRequest(accessObjectSchema), asyncHandler(accessObjectViaTemporaryUrl));

module.exports = router;
