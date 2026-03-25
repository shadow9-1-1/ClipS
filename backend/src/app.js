const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const routes = require('./routes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ============================================
// Body Parser Middleware
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// NoSQL Injection Protection Middleware
// ============================================
// express-mongo-sanitize prevents NoSQL injection attacks by sanitizing
// user-supplied data to prevent MongoDB operators from being executed.
//
// This middleware:
// - Replaces prohibited MongoDB operators: $ and .
// - Sanitizes: req.body, req.params, req.query
// - Prevents attacks like: { $gt: "" } or { "email.$ne": null }
// - Uses replaceWith: "_" to replace dangerous characters
//
// Example attack prevention:
// Input:  { "email": { "$ne": null } }
// Output: { "email": { "_ne": null } }
app.use(
    mongoSanitize({
        replaceWith: '_',
        onSanitize: ({ req, key }) => {
            // Optional: Log sanitization events for monitoring
            console.warn(`[SANITIZED] Key "${key}" contained prohibited characters`);
        },
    })
);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan(':method :url :status'));
}

app.use('/health', healthRoutes);
app.use('/api/v1', routes);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.statusCode = 404;
    next(err);
});

app.use(errorHandler);

module.exports = app;