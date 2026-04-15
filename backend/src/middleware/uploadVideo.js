const multer = require('multer');

const MAX_VIDEO_UPLOAD_BYTES = Number(process.env.MAX_VIDEO_UPLOAD_BYTES || 100 * 1024 * 1024);
const ALLOWED_VIDEO_MIME_TYPES = new Set(['video/mp4']);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_VIDEO_MIME_TYPES.has(file.mimetype)) {
    const err = new Error('Only video/mp4 files are allowed');
    err.statusCode = 400;
    return cb(err);
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_VIDEO_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter,
});

const handleVideoUpload = (fieldName = 'video') => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const sizeErr = new Error(`File too large. Max size is ${MAX_VIDEO_UPLOAD_BYTES} bytes`);
        sizeErr.statusCode = 413;
        return next(sizeErr);
      }

      const uploadErr = new Error(err.message || 'Upload validation failed');
      uploadErr.statusCode = 400;
      return next(uploadErr);
    }

    if (err) {
      return next(err);
    }

    if (!req.file) {
      const noFileErr = new Error('Video file is required');
      noFileErr.statusCode = 400;
      return next(noFileErr);
    }

    return next();
  });
};

module.exports = {
  handleVideoUpload,
  MAX_VIDEO_UPLOAD_BYTES,
  ALLOWED_VIDEO_MIME_TYPES,
};
