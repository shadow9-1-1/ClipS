const { z } = require('zod');

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const createSessionSchema = z.object({
  body: z
    .object({
      amount: z.preprocess(
        (value) => (typeof value === 'string' ? Number(value) : value),
        z
          .number({ invalid_type_error: 'Amount must be a number' })
          .positive('Amount must be greater than 0')
      ),
      currency: z
        .preprocess(
          (value) => (typeof value === 'string' ? value : undefined),
          z.string().trim().min(3).max(3)
        )
        .optional()
        .default('usd')
        .transform((value) => value.toLowerCase()),
      successUrl: z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().url('Invalid successUrl')
      ),
      cancelUrl: z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().url('Invalid cancelUrl')
      ),
      videoId: z
        .preprocess(
          (value) => (typeof value === 'string' ? value : undefined),
          z.string().regex(objectIdRegex, 'Invalid video id')
        )
        .optional(),
    })
    .strict(),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

module.exports = {
  createSessionSchema,
};
