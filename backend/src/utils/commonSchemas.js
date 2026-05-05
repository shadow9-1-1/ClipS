const { z } = require('zod');

const emptySchema = z.object({
  body: z.object({}).strict().default({}),
  params: z.object({}).strict().default({}),
  query: z.object({}).strict().default({}),
});

module.exports = {
  emptySchema,
};
