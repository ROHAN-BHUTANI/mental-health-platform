const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const mlClient = require('./utils/mlClient');
const { validate } = require('./middleware/validate');
const { mlPredictSchema } = require('./validation/schemas');
const { mlLimiter } = require('./middleware/rateLimit');
const { ok, fail } = require('./utils/response');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const developmentOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const allowedOrigins = Array.from(new Set([
  ...(process.env.NODE_ENV === 'production' ? [] : developmentOrigins),
  ...configuredOrigins
]));

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '100kb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.REQUEST_BODY_LIMIT || '100kb' }));

// Minimal request logger for debugging (avoid verbose prod logs)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${ms}ms)`);
    });
    next();
  });
}

// System routes (health / test-db)
const systemRoutes = require('./routes/system');
app.use('/api', systemRoutes);

// Example route that forwards to ML service
app.get('/api/predict-sample', async (req, res) => {
  try {
    const r = await mlClient.get('/');
    return ok(res, { ml: r.data });
  } catch (err) {
    return fail(res, 502, 'ml-service-unavailable');
  }
});

app.post('/api/ml-predict', mlLimiter, validate(mlPredictSchema), async (req, res) => {
  try {
    const response = await mlClient.post('/analyze', req.body || {});
    return ok(res, response.data || {});
  } catch (err) {
    return fail(res, 502, 'ml-service-unavailable');
  }
});

// Mount routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Mood entry routes (MVC)
const moodRoutes = require('./routes/mood');
app.use('/api/mood', moodRoutes);

// Mood log routes (per-day structured logging)
const moodLogRoutes = require('./routes/moodLog');
app.use('/api/mood', moodLogRoutes);

// AI Chat routes
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// User insights routes
const userInsightsRoutes = require('./routes/userInsights');
app.use('/api/user', userInsightsRoutes);

// Root status route
app.get('/', (_req, res) => {
  return ok(res, { message: 'API working' });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
