const { z } = require('zod');

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const createVideoSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
      description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
      videoURL: z.string().trim().optional(),
      duration: z
        .number({ invalid_type_error: 'Duration must be a number' })
        .positive('Duration must be a positive number')
        .max(300, 'Duration cannot exceed 300 seconds'),
      status: z.enum(['public', 'private', 'flagged']).optional(),
    })
    .strict(),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const updateVideoSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters').optional(),
      description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid video id'),
  }),
  query: z.object({}).default({}),
});

const videoIdParamSchema = z.object({
  body: z.object({}).default({}),
  query: z.object({}).default({}),
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid video id'),
  }),
});

const getVideosSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z
    .object({
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 20))
        .pipe(z.number().int().min(1).max(100)),
      skip: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0))
        .pipe(z.number().int().min(0)),
    })
    .default({}),
});

module.exports = {
  createVideoSchema,
  updateVideoSchema,
  videoIdParamSchema,
  getVideosSchema,
};
