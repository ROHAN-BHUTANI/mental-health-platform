'use strict';

/**
 * @module insightService
 * @description Encapsulates the analytics engine: aggregation, statistical analysis,
 * ML enrichment, caching, and insight/recommendation generation.
 * This file is the single source of truth for all derived health metrics.
 */

const mongoose = require('mongoose');
const MoodLog = require('../models/MoodLog');
const mlClient = require('../utils/mlClient');
const { generateRecommendations } = require('../utils/recommendationEngine');
const { computeScore } = require('../utils/healthScore');

// ---------------------------------------------------------------------------
// In-process analytics cache (TTL-based, per user)
// ---------------------------------------------------------------------------

const analyticsCache = new Map();
const CACHE_TTL_MS = 60 * 1_000; // 60 seconds

function _getCache(userId) {
  const entry = analyticsCache.get(String(userId));
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    analyticsCache.delete(String(userId));
    return null;
  }
  return entry.value;
}

function _setCache(userId, value) {
  analyticsCache.set(String(userId), {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

/**
 * Removes the cached analytics payload for a given user.
 * Should be called whenever new mood data is saved.
 * @param {string|object} userId
 */
function invalidateAnalyticsCache(userId) {
  if (!userId) return;
  analyticsCache.delete(String(userId));
}

// ---------------------------------------------------------------------------
// Pure statistical helpers
// ---------------------------------------------------------------------------

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const round = (v, d = 1) => Number((Number(v) || 0).toFixed(d));
const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

function _average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + (Number(v) || 0), 0) / values.length;
}

function _summarizeSeries(series) {
  return {
    entryCount: series.length,
    avgMood: round(_average(series.map((s) => s.mood)), 1),
    avgStress: round(_average(series.map((s) => s.stress)), 1),
    avgSleep: round(_average(series.map((s) => s.sleep)), 1)
  };
}

function _compareSeries(current, previous) {
  const cur = _summarizeSeries(current);
  const prev = _summarizeSeries(previous);
  return {
    current: cur,
    previous: prev,
    deltaMood: round(cur.avgMood - prev.avgMood, 1),
    deltaStress: round(cur.avgStress - prev.avgStress, 1),
    deltaSleep: round(cur.avgSleep - prev.avgSleep, 1)
  };
}

function _computeStreak(sortedDescLogs) {
  if (!sortedDescLogs.length) return 0;

  const seen = new Set();
  const uniqueDays = [];

  for (const log of sortedDescLogs) {
    const d = new Date(log.date);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString();
    if (!seen.has(key)) { seen.add(key); uniqueDays.push(d); }
  }

  let streak = 1;
  let prev = uniqueDays[0];

  for (let i = 1; i < uniqueDays.length; i++) {
    const diffDays = Math.round((prev - uniqueDays[i]) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) { streak++; prev = uniqueDays[i]; continue; }
    break;
  }

  return streak;
}

function _pearsonCorrelation(xs, ys) {
  const pairs = xs
    .map((x, i) => [Number(x), Number(ys[i])])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

  if (pairs.length < 2) return 0;

  const xv = pairs.map(([x]) => x);
  const yv = pairs.map(([, y]) => y);
  const xm = _average(xv);
  const ym = _average(yv);

  let num = 0, xd = 0, yd = 0;
  for (const [x, y] of pairs) {
    const dx = x - xm;
    const dy = y - ym;
    num += dx * dy; xd += dx * dx; yd += dy * dy;
  }

  return (!xd || !yd) ? 0 : clamp(num / Math.sqrt(xd * yd), -1, 1);
}

function _classifyEmotion(mood, stress, sleep) {
  if (mood >= 8 && stress <= 4 && sleep >= 7) return 'Calm';
  if (mood >= 6 && stress <= 6) return 'Balanced';
  if (mood >= 4 || sleep >= 7) return 'Uneasy';
  return 'At Risk';
}

function _classifyActivityImpact(mood, stress, sleep) {
  if (stress >= 8 || sleep < 6) return 'Overload';
  if (mood >= 8 && stress <= 5) return 'Momentum';
  if (sleep >= 8 && stress <= 4) return 'Recovery';
  return 'Routine';
}

function _buildDistribution(logs, classifier, labels) {
  const counts = Object.fromEntries(labels.map((l) => [l, 0]));
  for (const log of logs) counts[classifier(log.mood, log.stress, log.sleep)] = (counts[classifier(log.mood, log.stress, log.sleep)] || 0) + 1;
  return labels.map((l) => ({ name: l, value: counts[l] || 0 }));
}

function _buildDailySeries(logs) {
  const grouped = new Map();

  for (const log of logs) {
    const key = dayKey(log.date);
    const b = grouped.get(key) || { date: key, moodValues: [], stressValues: [], sleepValues: [], count: 0 };
    b.moodValues.push(Number(log.mood) || 0);
    b.stressValues.push(Number(log.stress) || 0);
    b.sleepValues.push(Number(log.sleep) || 0);
    b.count++;
    grouped.set(key, b);
  }

  return Array.from(grouped.values())
    .map((b) => ({
      date: b.date,
      mood: round(_average(b.moodValues), 1),
      stress: round(_average(b.stressValues), 1),
      sleep: round(_average(b.sleepValues), 1),
      entries: b.count
    }))
    .sort((a, z) => new Date(a.date) - new Date(z.date));
}

function _buildRiskLevel(score, trend, predictedFutureRisk) {
  const elevated = Number(predictedFutureRisk) || 0;
  if (score < 40 || elevated >= 0.7 || trend === 'increasing') return 'High';
  if (score < 70 || elevated >= 0.45) return 'Moderate';
  return 'Low';
}

function _buildSuggestion(status, recommendations, latestEntry) {
  if (status === 'High Risk') {
    return 'Pause today, reduce commitments, and use one grounding exercise before your next task.';
  }
  if (Array.isArray(recommendations) && recommendations.length) return recommendations[0];
  if (latestEntry) return 'Keep building on the routine that produced your latest stable entry.';
  return 'Check in tomorrow to keep your trend data current.';
}

// ---------------------------------------------------------------------------
// Empty-state payload
// ---------------------------------------------------------------------------

function _buildEmptyPayload(user) {
  return {
    user: { id: user?._id, name: user?.name || '' },
    totalEntries: 0,
    avgMood: 0, avgStress: 0, avgSleep: 0,
    streak_count: 0,
    lastMoodEntry: null,
    emotionalStabilityScore: 100,
    riskLevel: 'Low',
    aiSuggestionOfDay: 'Create your first mood log to unlock personalized analytics.',
    confidence: 0, score: 100, status: 'Stable',
    recommendations: [],
    insights: 'No entries yet. Start logging daily to generate trend insights.',
    summary: {
      weeklyInsights: { current: { entryCount: 0, avgMood: 0, avgStress: 0, avgSleep: 0 }, previous: { entryCount: 0, avgMood: 0, avgStress: 0, avgSleep: 0 }, deltaMood: 0, deltaStress: 0, deltaSleep: 0 },
      monthlyInsights: { current: { entryCount: 0, avgMood: 0, avgStress: 0, avgSleep: 0 }, previous: { entryCount: 0, avgMood: 0, avgStress: 0, avgSleep: 0 }, deltaMood: 0, deltaStress: 0, deltaSleep: 0 }
    },
    charts: { moodTrend: [], stressTrend: [], emotionDistribution: [], activityImpact: [] },
    recentEntries: [],
    ml: {}
  };
}

// ---------------------------------------------------------------------------
// Core analytics builder
// ---------------------------------------------------------------------------

/**
 * Computes (or returns cached) the full analytics payload for a user.
 * @param {object} user - `{ _id, name }` shape from req.user
 * @returns {Promise<object>} analytics payload
 */
async function buildAnalyticsPayload(user) {
  const cacheKey = user?._id;
  const cached = _getCache(cacheKey);
  if (cached) return cached;

  const userId = new mongoose.Types.ObjectId(String(cacheKey));
  
  // Production Safety: Limit history fetch to the last 90 days to prevent OOM errors on large datasets
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const logs = await MoodLog.find({ 
    userId, 
    date: { $gte: ninetyDaysAgo } 
  }).sort({ date: 1 }).lean();

  if (!logs.length) {
    const empty = _buildEmptyPayload(user);
    _setCache(cacheKey, empty);
    return empty;
  }

  const dailySeries = _buildDailySeries(logs);
  const totalEntries = logs.length;
  const latestEntry = logs[logs.length - 1];
  const recentEntries = logs.slice(-5).reverse();
  const streakCount = _computeStreak([...logs].reverse());

  const weeklySeries = dailySeries.slice(-7);
  const prevWeeklySeries = dailySeries.slice(Math.max(0, dailySeries.length - 14), Math.max(0, dailySeries.length - 7));
  const monthlySeries = dailySeries.slice(-30);
  const prevMonthlySeries = dailySeries.slice(Math.max(0, dailySeries.length - 60), Math.max(0, dailySeries.length - 30));

  const weeklyInsights = _compareSeries(weeklySeries, prevWeeklySeries);
  const monthlyInsights = _compareSeries(monthlySeries, prevMonthlySeries);

  const moodValues = logs.map((l) => Number(l.mood) || 0);
  const stressValues = logs.map((l) => Number(l.stress) || 0);
  const sleepValues = logs.map((l) => Number(l.sleep) || 0);

  const moodTrend = dailySeries.map(({ date, mood, stress, sleep, entries }) => ({ date, mood, stress, sleep, entries }));
  const stressTrend = dailySeries.map(({ date, stress }) => ({ date, value: stress }));
  const emotionDistribution = _buildDistribution(logs, _classifyEmotion, ['Calm', 'Balanced', 'Uneasy', 'At Risk']);
  const activityImpact = _buildDistribution(logs, _classifyActivityImpact, ['Recovery', 'Routine', 'Momentum', 'Overload']);

  const sleepMoodCorrelation = round(_pearsonCorrelation(moodValues, sleepValues), 2);
  const stressVolatility = round(_average(dailySeries.slice(1).map((s, i) => Math.abs(s.stress - dailySeries[i].stress))), 2);
  const moodVolatility = round(_average(dailySeries.slice(1).map((s, i) => Math.abs(s.mood - dailySeries[i].mood))), 2);

  // ML enrichment (best-effort)
  let mlData = {};
  try {
    const res = await mlClient.post('/api/analyze', {
      text: latestEntry?.text || '',
      historyScores: logs.slice(-7).map((l) => Number(l.moodScore) || 0),
      stressHistory: logs.slice(-7).map((l) => Number(l.stressScore) || 0)
    });
    mlData = res.data || {};
  } catch {
    mlData = {};
  }

  const burnout = mlData.burnout || {};
  const predictedFutureRisk = Number(mlData.predictedFutureRisk ?? burnout.risk_score ?? 0);
  const burnoutTrend = mlData.stressTrend?.trend || burnout.trend || 'stable';
  const alertMessage = burnout.alert_message || 'Your trend looks steady. Keep going.';

  const avgMood = _average(moodValues);
  const avgStress = _average(stressValues);
  const avgSleep = _average(sleepValues);

  const healthScore = computeScore({ risk_score: predictedFutureRisk, avg_stress: avgStress, avg_sleep: avgSleep });
  const recommendationsPayload = generateRecommendations({
    risk_score: predictedFutureRisk,
    trend: burnoutTrend,
    avg_sleep: avgSleep,
    latest_stress: latestEntry?.stress || avgStress
  });

  const emotionalStabilityScore = clamp(
    Math.round(100 - ((moodVolatility * 10) + (stressVolatility * 8) + (Math.abs(sleepMoodCorrelation) * 5))),
    0,
    100
  );

  const riskLevel = _buildRiskLevel(healthScore.score, burnoutTrend, predictedFutureRisk);
  const aiSuggestionOfDay = _buildSuggestion(recommendationsPayload.status, recommendationsPayload.recommendations, latestEntry);

  const payload = {
    user: { id: user?._id, name: user?.name || '' },
    totalEntries,
    avgMood: round(avgMood, 1),
    avgStress: round(avgStress, 1),
    avgSleep: round(avgSleep, 1),
    streak_count: streakCount,
    lastMoodEntry: latestEntry ? { date: latestEntry.date, mood: latestEntry.mood, stress: latestEntry.stress, sleep: latestEntry.sleep } : null,
    emotionalStabilityScore,
    riskLevel,
    aiSuggestionOfDay,
    confidence: round(Number(mlData.confidence ?? mlData.sentimentScore ?? 0), 2),
    score: healthScore.score,
    status: healthScore.status,
    recommendations: recommendationsPayload.recommendations,
    insights: recommendationsPayload.insights,
    alert_message: alertMessage,
    burnout,
    ml: mlData,
    summary: {
      weeklyInsights,
      monthlyInsights,
      sleepMoodCorrelation,
      moodVolatility,
      stressVolatility,
      avgMood: round(avgMood, 1),
      avgStress: round(avgStress, 1),
      avgSleep: round(avgSleep, 1)
    },
    charts: { moodTrend, stressTrend, emotionDistribution, activityImpact },
    recentEntries
  };

  _setCache(cacheKey, payload);
  return payload;
}

module.exports = { buildAnalyticsPayload, invalidateAnalyticsCache };
