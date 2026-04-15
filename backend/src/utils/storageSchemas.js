const { z } = require('zod');

const uploadTestFileSchema = z.object({
  body: z
    .object({
      filename: z.string().trim().min(1, 'Filename is required').max(255, 'Filename cannot exceed 255 characters'),
      base64Data: z
        .string()
        .trim()
        .min(1, 'base64Data is required')
        .regex(/^[A-Za-z0-9+/=\r\n]+$/, 'base64Data must be a valid base64 string'),
      contentType: z.string().trim().min(1, 'Content type is required').max(100).optional(),
      bucket: z.string().trim().min(1).max(63).optional(),
      keyPrefix: z.string().trim().min(1).max(100).optional(),
    })
    .strict(),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const createTemporaryUrlSchema = z.object({
  body: z
    .object({
      key: z.string().trim().min(1, 'key is required').max(2048, 'key is too long'),
      bucket: z.string().trim().min(1).max(63).optional(),
      expiresIn: z
        .number({ invalid_type_error: 'expiresIn must be a number' })
        .int('expiresIn must be an integer')
        .positive('expiresIn must be positive')
        .max(86400, 'expiresIn cannot exceed 86400 seconds')
        .optional(),
    })
    .strict(),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const accessObjectSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    bucket: z.string().trim().min(1).max(63).optional(),
    key: z.string().trim().min(1, 'key is required').max(2048, 'key is too long'),
    expiresAt: z.string().regex(/^\d+$/, 'expiresAt must be a unix milliseconds timestamp'),
    signature: z.string().trim().min(1, 'signature is required').max(128),
  }),
});

module.exports = {
  uploadTestFileSchema,
  createTemporaryUrlSchema,
  accessObjectSchema,
};
