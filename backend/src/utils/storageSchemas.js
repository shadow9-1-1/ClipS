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

module.exports = {
  uploadTestFileSchema,
};
