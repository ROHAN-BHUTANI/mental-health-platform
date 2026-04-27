'use strict';

/**
 * @module routes/index
 * @description Central route registry.
 * All route modules are mounted here to keep app.js clean.
 * Adding a new feature = add one line here.
 */

const express = require('express');
const router = express.Router();

// System routes (health, db connectivity)
const systemRoutes = require('./system');

// Domain routes
const authRoutes = require('./auth');
const moodRoutes = require('./mood');
const moodLogRoutes = require('./moodLog');
const chatRoutes = require('./chat');
const userInsightsRoutes = require('./userInsights');
const wellnessRoutes = require('./wellness');

// ── System ───────────────────────────────────────────────────────────────────
router.use('/', systemRoutes);

// ── Auth ─────────────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Mood ─────────────────────────────────────────────────────────────────────
router.use('/mood', moodRoutes);      // POST / GET  /api/mood
router.use('/mood', moodLogRoutes);   // POST        /api/mood/log  GET /api/mood/history

// ── Chat ─────────────────────────────────────────────────────────────────────
router.use('/chat', chatRoutes);

// ── User (insights, analytics, profile, subscription) ────────────────────────
router.use('/user', userInsightsRoutes);

// ── Wellness (tips, breathing, community insights) ──────────────────────────
router.use('/wellness', wellnessRoutes);

module.exports = router;
