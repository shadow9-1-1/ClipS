const {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
} = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const getStorageConfig = () => {
  const endpoint = process.env.S3_ENDPOINT || 'http://127.0.0.1:9000';
  const region = process.env.S3_REGION || 'us-east-1';
  const accessKeyId = process.env.S3_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin';
  const secretAccessKey = process.env.S3_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin';
  const bucket = process.env.S3_BUCKET || 'media';
  const backendBaseUrl = process.env.BACKEND_BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;
  const presignedUrlExpiresIn = Number(process.env.S3_PRESIGNED_URL_EXPIRES_IN || 300);
  const signingSecret = process.env.STORAGE_URL_SIGNING_SECRET || process.env.JWT_SECRET || 'clips-storage-signing-secret';

  return {
    endpoint,
    region,
    accessKeyId,
    secretAccessKey,
    bucket,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    backendBaseUrl,
    presignedUrlExpiresIn,
    signingSecret,
  };
};

const storageConfig = getStorageConfig();

const s3Client = new S3Client({
  endpoint: storageConfig.endpoint,
  region: storageConfig.region,
  forcePathStyle: storageConfig.forcePathStyle,
  credentials: {
    accessKeyId: storageConfig.accessKeyId,
    secretAccessKey: storageConfig.secretAccessKey,
  },
});

const ensureBucketExists = async (bucketName) => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (err) {
    const statusCode = err?.$metadata?.httpStatusCode;
    const notFound = statusCode === 404 || err?.name === 'NotFound' || err?.name === 'NoSuchBucket';

    if (!notFound) {
      throw err;
    }

    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
  }
};

const normalizeExpiresIn = (requestedSeconds) => {
  const defaultSeconds = storageConfig.presignedUrlExpiresIn;
  const parsed = Number(requestedSeconds || defaultSeconds);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    const err = new Error('expiresIn must be a positive number');
    err.statusCode = 400;
    throw err;
  }

  return Math.min(Math.floor(parsed), 60 * 60 * 24);
};

const buildSignature = ({ bucket, key, expiresAt }) => {
  const payload = `${bucket}:${key}:${expiresAt}`;
  return crypto.createHmac('sha256', storageConfig.signingSecret).update(payload).digest('hex');
};

const generateTemporaryAccessUrl = ({ bucket, key, expiresIn }) => {
  const targetBucket = bucket || storageConfig.bucket;
  const validFor = normalizeExpiresIn(expiresIn);
  const expiresAt = Date.now() + validFor * 1000;
  const signature = buildSignature({
    bucket: targetBucket,
    key,
    expiresAt,
  });

  const base = storageConfig.backendBaseUrl.replace(/\/$/, '');
  const query = new URLSearchParams({
    bucket: targetBucket,
    key,
    expiresAt: String(expiresAt),
    signature,
  });

  return {
    accessUrl: `${base}/api/v1/storage/access?${query.toString()}`,
    expiresIn: validFor,
    expiresAt,
  };
};

const getObjectForSecureAccess = async ({ bucket, key, expiresAt, signature }) => {
  const targetBucket = bucket || storageConfig.bucket;
  const expectedSignature = buildSignature({
    bucket: targetBucket,
    key,
    expiresAt,
  });

  const isValidSignature =
    typeof signature === 'string' &&
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!isValidSignature) {
    const err = new Error('Invalid or tampered access URL');
    err.statusCode = 403;
    throw err;
  }

  if (Date.now() > Number(expiresAt)) {
    const err = new Error('Access URL has expired');
    err.statusCode = 403;
    throw err;
  }

  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: targetBucket,
      Key: key,
    })
  );

  return {
    stream: response.Body,
    contentType: response.ContentType || 'application/octet-stream',
    contentLength: response.ContentLength,
    etag: response.ETag,
  };
};

const uploadBuffer = async ({ bucket, key, body, contentType }) => {
  const targetBucket = bucket || storageConfig.bucket;

  await ensureBucketExists(targetBucket);

  const command = new PutObjectCommand({
    Bucket: targetBucket,
    Key: key,
    Body: body,
    ContentType: contentType || 'application/octet-stream',
  });

  const result = await s3Client.send(command);
  const temporaryAccess = generateTemporaryAccessUrl({
    bucket: targetBucket,
    key,
  });

  return {
    bucket: targetBucket,
    key,
    etag: result.ETag,
    ...temporaryAccess,
  };
};

const uploadBase64Object = async ({ bucket, keyPrefix, filename, base64Data, contentType }) => {
  const safePrefix = (keyPrefix || 'uploads').replace(/^\/+|\/+$/g, '');
  const safeName = filename.replace(/\s+/g, '-');
  const objectKey = `${safePrefix}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(base64Data, 'base64');

  return uploadBuffer({
    bucket,
    key: objectKey,
    body: buffer,
    contentType,
  });
};

const uploadVideoObject = async ({ file, ownerId, bucket, duration }) => {
  if (!file || !file.buffer) {
    const err = new Error('Video file is required');
    err.statusCode = 400;
    throw err;
  }

  const targetBucket = bucket || process.env.S3_VIDEO_BUCKET || storageConfig.bucket;
  const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
  const ownerPrefix = ownerId ? `videos/${ownerId}` : 'videos/anonymous';
  const objectKey = `${ownerPrefix}/${Date.now()}-${safeOriginalName}`;

  const uploaded = await uploadBuffer({
    bucket: targetBucket,
    key: objectKey,
    body: file.buffer,
    contentType: file.mimetype,
  });

  return {
    ...uploaded,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    duration,
  };
};

const testConnection = async () => {
  await ensureBucketExists(storageConfig.bucket);

  return {
    status: 'connected',
    endpoint: storageConfig.endpoint,
    bucket: storageConfig.bucket,
  };
};

module.exports = {
  testConnection,
  uploadBase64Object,
  uploadVideoObject,
  generateTemporaryAccessUrl,
  getObjectForSecureAccess,
};
