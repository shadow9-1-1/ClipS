const { z } = require('zod');

const requiredString = (fieldName) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value : ''),
    z.string().trim().min(1, `${fieldName} is required`)
  );

const registerSchema = z.object({
  body: z
    .object({
      username: z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z
          .string()
          .trim()
          .min(3, 'Username must be at least 3 characters')
          .max(30, 'Username cannot exceed 30 characters')
          .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      ),
      email: z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z
          .string()
          .trim()
          .min(1, 'Email is required')
          .email('Invalid email address')
      ),
      password: z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z.string().min(8, 'Password must be at least 8 characters long')
      ),
    })
    .strict(),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const loginSchema = z.object({
  body: z
    .object({
      email: z.preprocess(
        (value) => (typeof value === 'string' ? value : ''),
        z
          .string()
          .trim()
          .min(1, 'Email is required')
          .email('Invalid email address')
      ),
      password: requiredString('Password'),
    })
    .strict(),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

module.exports = {
  registerSchema,
  loginSchema,
};
