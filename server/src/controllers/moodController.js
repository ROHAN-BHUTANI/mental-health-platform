'use strict';

/**
 * @module moodController
 * @description Thin request/response layer for mood entry routes.
 * All business logic lives in `services/moodService`.
 */

const moodService = require('../services/moodService');
const { invalidateAnalyticsCache } = require('../services/insightService');
const { ok, fail } = require('../utils/response');

/** POST /api/mood */
exports.createMood = async (req, res) => {
  try {
    if (!req.user) return fail(res, 401, 'Unauthorized');

    const entry = await moodService.createMoodEntry(
      req.user._id,
      req.body,
      invalidateAnalyticsCache
    );

    return ok(res, entry, 201);
  } catch (error) {
    console.error('Mood creation error:', error);
    return fail(res, error.statusCode || 500, error.message);
  }
};

/** GET /api/mood */
exports.getMoods = async (req, res) => {
  try {
    if (!req.user) return fail(res, 401, 'Unauthorized');

    const moods = await moodService.getMoodEntries(req.user._id);
    return ok(res, moods);
  } catch (error) {
    console.error('Fetch moods error:', error);
    return fail(res, 500, error.message);
  }
};
