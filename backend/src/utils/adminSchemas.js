const { z } = require('zod');

const updateUserStatusSchema = z.object({
    body: z
        .object({
            active: z.boolean({
                required_error: 'Status (active) is required',
                invalid_type_error: 'Status (active) must be a boolean',
            }),
        })
        .strict(),
    params: z
        .object({
            id: z.string().min(1, 'User ID is required'),
        })
        .strict(),
    query: z.object({}).default({}),
});

module.exports = {
    updateUserStatusSchema,
};