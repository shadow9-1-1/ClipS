const { ZodError } = require('zod');

const validateRequest = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = parsed.body;
    req.params = parsed.params;
    req.query = parsed.query;

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const validationError = new Error(err.issues[0]?.message || 'Validation failed');
      validationError.statusCode = 400;
      return next(validationError);
    }

    return next(err);
  }
};

module.exports = validateRequest;
