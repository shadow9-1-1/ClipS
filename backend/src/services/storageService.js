const {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  CreateBucketCommand,
} = require('@aws-sdk/client-s3');

const getStorageConfig = () => {
  const endpoint = process.env.S3_ENDPOINT || 'http://127.0.0.1:9000';
  const region = process.env.S3_REGION || 'us-east-1';
  const accessKeyId = process.env.S3_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin';
  const secretAccessKey = process.env.S3_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin';
  const bucket = process.env.S3_BUCKET || 'media';

  return {
    endpoint,
    region,
    accessKeyId,
    secretAccessKey,
    bucket,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || endpoint,
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

const buildObjectUrl = (bucket, key) => {
  const base = storageConfig.publicBaseUrl.replace(/\/$/, '');

  if (storageConfig.forcePathStyle) {
    return `${base}/${bucket}/${key}`;
  }

  const endpointWithoutProtocol = base.replace(/^https?:\/\//, '');
  const protocol = base.startsWith('https://') ? 'https' : 'http';
  return `${protocol}://${bucket}.${endpointWithoutProtocol}/${key}`;
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

  return {
    bucket: targetBucket,
    key,
    etag: result.ETag,
    url: buildObjectUrl(targetBucket, key),
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
};
