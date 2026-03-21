const { z } = require('zod');

const registerSchema = z.object({
  body: z
    .object({
      username: z
        .string({ required_error: 'Username is required' })
        .trim()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username cannot exceed 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
      email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters long'),
    })
    .strict(),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const loginSchema = z.object({
  body: z
    .object({
      email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address'),
      password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
    })
    .strict(),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

module.exports = {
  registerSchema,
  loginSchema,
};
