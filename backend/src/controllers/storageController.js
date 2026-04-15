const { testConnection, uploadBase64Object } = require('../services/storageService');

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

module.exports = {
  checkStorageConnection,
  uploadTestFile,
};
