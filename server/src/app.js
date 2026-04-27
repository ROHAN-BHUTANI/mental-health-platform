'use strict';

/**
 * @module app
 * @description Express application factory.
 * Responsibilities here are limited to:
 *  - Security middleware (helmet, CORS)
 *  - Body parsing
 *  - Request logging (dev only)
 *  - Mounting the central router
 *  - Global error handling
 *
 * Route definitions live in `routes/index.js`.
 * Business logic lives in `services/`.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const router = require('./routes/index');
const { ok } = require('./utils/response');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ---------------------------------------------------------------------------
// CORS configuration
// ---------------------------------------------------------------------------

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([
  ...(process.env.NODE_ENV === 'production' ? [] : DEV_ORIGINS),
  ...configuredOrigins
]));

const isLocalOrigin = (origin) =>
  origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

// ---------------------------------------------------------------------------
// App bootstrap
// ---------------------------------------------------------------------------

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin(origin, callback) {
    const isDevMode = process.env.NODE_ENV !== 'production';
    const isAllowed = !origin || allowedOrigins.includes(origin) || (isDevMode && isLocalOrigin(origin));
    return isAllowed
      ? callback(null, true)
      : callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

// Body parsing
const bodyLimit = process.env.REQUEST_BODY_LIMIT || '100kb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// Dev request logger
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    const start = Date.now();
    _res.on('finish', () =>
      console.log(`${req.method} ${req.originalUrl} — ${_res.statusCode} (${Date.now() - start}ms)`)
    );
    next();
  });
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Root liveness probe
app.get('/', (_req, res) => ok(res, { message: 'API working' }));

// All domain routes via the central registry
app.use('/api', router);

// ---------------------------------------------------------------------------
// Error handling (must be last)
// ---------------------------------------------------------------------------

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
