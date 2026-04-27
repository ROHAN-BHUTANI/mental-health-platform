'use strict';

/**
 * @module insightController
 * @description Thin request/response layer for insight and analytics routes.
 * All business logic lives in `services/insightService`.
 *
 * NOTE: `invalidateAnalyticsCache` is re-exported here so that existing
 * internal callers (moodController, moodLogController) continue to work
 * through the same import path during the transition period.
 * New code should import directly from `services/insightService`.
 */

const { buildAnalyticsPayload, invalidateAnalyticsCache } = require('../services/insightService');
const { ok, fail } = require('../utils/response');

// Re-export for backward compatibility
exports.invalidateAnalyticsCache = invalidateAnalyticsCache;

/** GET /api/user/analytics */
exports.getAnalytics = async (req, res) => {
  try {
    const user = req.user;
    if (!user?._id) return fail(res, 401, 'Unauthorized');

    const analytics = await buildAnalyticsPayload(user);
    return ok(res, analytics);
  } catch (error) {
    console.error('getAnalytics error:', error?.message || error);
    return fail(res, 500, error.message);
  }
};

/** GET /api/user/insights */
exports.getInsights = async (req, res) => {
  try {
    const user = req.user;
    if (!user?._id) return fail(res, 401, 'Unauthorized');

    const analytics = await buildAnalyticsPayload(user);

    return ok(res, {
      risk_score: analytics.burnout?.risk_score ?? 0,
      trend: analytics.burnout?.trend || 'stable',
      alert_message: analytics.alert_message,
      status: analytics.status,
      recommendations: analytics.recommendations,
      insights: analytics.insights,
      score: analytics.score,
      streak_count: analytics.streak_count,
      meta: {
        avg_sleep: analytics.avgSleep,
        latest_stress: analytics.lastMoodEntry?.stress || 0
      },
      analytics
    });
  } catch (error) {
    console.error('getInsights error:', error?.message || error);
    return fail(res, 500, error.message);
  }
};