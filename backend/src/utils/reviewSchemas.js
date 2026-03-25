const { z } = require('zod');

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const createReviewSchema = z.object({
  body: z
    .object({
      rating: z
        .number({ required_error: 'Rating is required', invalid_type_error: 'Rating must be a number' })
        .int('Rating must be an integer')
        .min(1, 'Rating must be between 1 and 5')
        .max(5, 'Rating must be between 1 and 5'),
      comment: z.string().trim().max(1000, 'Comment cannot exceed 1000 characters').optional().default(''),
    })
    .strict(),
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid video id'),
  }),
  query: z.object({}).default({}),
});

module.exports = {
  createReviewSchema,
};
