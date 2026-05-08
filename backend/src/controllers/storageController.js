const {
  testConnection,
  uploadBase64Object,
  generateTemporaryAccessUrl,
  getObjectForSecureAccess,
} = require('../services/storageService');

const checkStorageConnection = async (req, res) => {
  const data = await testConnection();

  res.status(200).json({
    status: 'success',
    data,
  });
};

const uploadTestFile = async (req, res) => {
  const result = await uploadBase64Object({
    bucket: req.body.bucket,
    keyPrefix: req.body.keyPrefix,
    filename: req.body.filename,
    base64Data: req.body.base64Data,
    contentType: req.body.contentType,
  });

  res.status(201).json({
    status: 'success',
    message: 'File uploaded to object storage successfully',
    data: result,
  });
};

const createTemporaryUrl = async (req, res) => {
  const data = generateTemporaryAccessUrl({
    bucket: req.body.bucket,
    key: req.body.key,
    expiresIn: req.body.expiresIn,
  });

  res.status(200).json({
    status: 'success',
    data,
  });
};

const accessObjectViaTemporaryUrl = async (req, res) => {
  const bucket = Array.isArray(req.query.bucket) ? req.query.bucket[0] : req.query.bucket;
  const key = Array.isArray(req.query.key) ? req.query.key[0] : req.query.key;
  const expiresAt = Array.isArray(req.query.expiresAt) ? req.query.expiresAt[0] : req.query.expiresAt;
  const signature = Array.isArray(req.query.signature) ? req.query.signature[0] : req.query.signature;
  const range = typeof req.headers.range === 'string' ? req.headers.range : undefined;

  const object = await getObjectForSecureAccess({
    bucket,
    key,
    expiresAt,
    signature,
    range,
  });

  res.setHeader('Content-Type', object.contentType);
  res.setHeader('Accept-Ranges', 'bytes');
  if (typeof object.contentLength !== 'undefined') {
    res.setHeader('Content-Length', String(object.contentLength));
  }
  if (object.contentRange) {
    res.status(206);
    res.setHeader('Content-Range', object.contentRange);
  }
  if (object.etag) {
    res.setHeader('ETag', object.etag);
  }

  object.stream.pipe(res);
};

module.exports = {
  checkStorageConnection,
  uploadTestFile,
  createTemporaryUrl,
  accessObjectViaTemporaryUrl,
};
