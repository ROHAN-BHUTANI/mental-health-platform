'use strict';

/**
 * @module moodLogController
 * @description Thin request/response layer for mood log routes.
 * All business logic lives in `services/moodService`.
 */

const moodService = require('../services/moodService');
const { invalidateAnalyticsCache } = require('../services/insightService');
const { ok, fail } = require('../utils/response');

/** POST /api/mood/log */
exports.logMood = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return fail(res, 401, 'Unauthorized');

    const doc = await moodService.logMoodEntry(userId, req.body, invalidateAnalyticsCache);
    return ok(res, doc, 201);
  } catch (error) {
    console.error('logMood error:', error);
    return fail(res, error.statusCode || 500, error.message);
  }
};

/** GET /api/mood/history */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return fail(res, 401, 'Unauthorized');

    const logs = await moodService.getMoodHistory(userId);
    return ok(res, logs);
  } catch (error) {
    console.error('getHistory error:', error);
    return fail(res, 500, error.message);
  }
};
