const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const healthRoutes = require('./routes/healthRoutes');
const { handleWebhook } = require('./controllers/paymentController');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiters');
const { swaggerSpec } = require('./config/swagger');

const app = express();

// ============================================
// CORS (Next.js on :3000 → API on :5000)
// ============================================
const defaultDevOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const extraOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }
            const allowed = [...defaultDevOrigins, ...extraOrigins];
            if (allowed.includes(origin)) {
                return callback(null, true);
            }
            if (process.env.NODE_ENV !== 'production') {
                if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
                    return callback(null, true);
                }
            }
            return callback(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    })
);

// ============================================
// Body Parser Middleware
// ============================================
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);
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

app.use(apiLimiter);

app.use('/health', healthRoutes);
app.use('/api/v1', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.statusCode = 404;
    next(err);
});

app.use(errorHandler);

module.exports = app;