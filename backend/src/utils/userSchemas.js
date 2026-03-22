const { z } = require('zod');

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const updateMeSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username cannot exceed 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .optional(),
      bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional(),
      avatarKey: z.string().trim().max(255, 'Avatar key cannot exceed 255 characters').optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const userIdParamSchema = z.object({
  body: z.object({}).default({}),
  query: z.object({}).default({}),
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid user id'),
  }),
});

module.exports = {
  updateMeSchema,
  userIdParamSchema,
};
