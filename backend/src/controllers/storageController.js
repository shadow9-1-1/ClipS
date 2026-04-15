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
  const object = await getObjectForSecureAccess({
    bucket: req.query.bucket,
    key: req.query.key,
    expiresAt: req.query.expiresAt,
    signature: req.query.signature,
  });

  res.setHeader('Content-Type', object.contentType);
  if (typeof object.contentLength !== 'undefined') {
    res.setHeader('Content-Length', String(object.contentLength));
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
