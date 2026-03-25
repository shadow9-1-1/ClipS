const { z } = require('zod');

const createVideoSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
      description: z
        .string()
        .trim()
        .max(2000, 'Description cannot exceed 2000 characters')
        .optional()
        .default(''),
      videoURL: z.string().trim().url('Please provide a valid video URL'),
      duration: z
        .number({ required_error: 'Duration is required', invalid_type_error: 'Duration must be a number' })
        .min(0, 'Duration cannot be negative')
        .max(300, 'Duration must be less than or equal to 300 seconds'),
      status: z.enum(['public', 'private', 'flagged']).optional().default('public'),
    })
    .strict(),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

module.exports = {
  createVideoSchema,
};
