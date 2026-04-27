'use strict';

/**
 * @module moodService
 * @description Handles all mood-related business logic including entry creation,
 * ML analysis orchestration, MoodLog synchronisation, and history retrieval.
 * Both moodController and moodLogController delegate to this service.
 */

const MoodEntry = require('../models/MoodEntry');
const MoodLog = require('../models/MoodLog');
const mlClient = require('../utils/mlClient');

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Validates that `value` is a finite number within [min, max].
 * @param {*} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
const isValidRange = (value, min, max) =>
  Number.isFinite(value) && value >= min && value <= max;

// ---------------------------------------------------------------------------
// Exported service methods
// ---------------------------------------------------------------------------

/**
 * Creates a new MoodEntry backed by ML sentiment analysis.
 * Simultaneously appends a compatible MoodLog record for the analytics pipeline.
 *
 * @param {string} userId
 * @param {{ text: string, moodScore: number, stressScore: number, sleepHours: number }} data
 * @param {Function} onCacheInvalidate  - callback to purge the analytics cache
 * @returns {Promise<object>} the saved MoodEntry plain object
 * @throws {Error} with `statusCode` on validation failures
 */
async function createMoodEntry(userId, { text, moodScore, stressScore, sleepHours }, onCacheInvalidate) {
  if (!text || !String(text).trim()) {
    const err = new Error('Mood text is required');
    err.statusCode = 400;
    throw err;
  }

  const mood = Number(moodScore);
  const stress = Number(stressScore);
  const sleep = Number(sleepHours);

  if (!isValidRange(mood, 1, 10)) {
    const err = new Error('moodScore must be between 1-10');
    err.statusCode = 400;
    throw err;
  }
  if (!isValidRange(stress, 1, 10)) {
    const err = new Error('stressScore must be between 1-10');
    err.statusCode = 400;
    throw err;
  }
  if (!isValidRange(sleep, 0, 24)) {
    const err = new Error('sleepHours must be between 0-24');
    err.statusCode = 400;
    throw err;
  }

  // Fetch recent history for richer ML context
  const previousMoods = await MoodEntry.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(7);

  const previousSentimentScores = previousMoods.map((m) => m.sentimentScore || 0).reverse();
  const previousStressScores = previousMoods.map((m) => m.stressScore || 0).reverse();

  // Call ML service — fall back gracefully if unavailable
  let mlData = {};
  try {
    const mlResponse = await mlClient.post('/api/analyze', {
      text,
      historyScores: previousSentimentScores,
      stressHistory: previousStressScores
    });
    mlData = mlResponse.data || {};
  } catch {
    mlData = { ...mlClient.fallbackAnalyzePayload };
  }

  const moodEntry = await MoodEntry.create({
    user: userId,
    text: String(text).trim(),
    moodScore: mood,
    stressScore: stress,
    sleepHours: sleep,
    ...mlData
  });

  // Keep MoodLog in sync for the analytics/insight pipeline
  await MoodLog.create({ userId, mood, stress, sleep, date: new Date() });

  if (typeof onCacheInvalidate === 'function') {
    onCacheInvalidate(userId);
  }

  return moodEntry.toObject ? moodEntry.toObject() : moodEntry;
}

/**
 * Retrieves all MoodEntry records for a user sorted chronologically.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
async function getMoodEntries(userId) {
  return MoodEntry.find({ user: userId }).sort({ createdAt: 1 });
}

/**
 * Creates a structured MoodLog entry (used by the /mood/log endpoint).
 * Also mirrors the record into MoodEntry to keep both collections aligned.
 *
 * @param {string} userId
 * @param {{ moodScore: number, stressScore: number, sleepHours: number, date?: string, text?: string }} data
 * @param {Function} onCacheInvalidate
 * @returns {Promise<object>} the saved MoodLog document
 * @throws {Error} with `statusCode` on validation failures
 */
async function logMoodEntry(userId, { moodScore, stressScore, sleepHours, date, text }, onCacheInvalidate) {
  const moodNum = Number(moodScore);
  const stressNum = Number(stressScore);
  const sleepNum = Number(sleepHours);

  if (!isValidRange(moodNum, 1, 10)) {
    const err = new Error('mood must be 1-10');
    err.statusCode = 400;
    throw err;
  }
  if (!isValidRange(stressNum, 1, 10)) {
    const err = new Error('stress must be 1-10');
    err.statusCode = 400;
    throw err;
  }
  if (!isValidRange(sleepNum, 0, 24)) {
    const err = new Error('sleep must be 0-24 hours');
    err.statusCode = 400;
    throw err;
  }

  const dateVal = date ? new Date(date) : new Date();
  // Preserve the selected calendar day but use the current time so multiple
  // entries on the same day remain distinct documents.
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const now = new Date();
    dateVal.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  }

  const doc = await MoodLog.create({ userId, mood: moodNum, stress: stressNum, sleep: sleepNum, date: dateVal });

  const safeText = typeof text === 'string' ? text.trim() : '';
  await MoodEntry.create({
    user: userId,
    text: safeText || `Mood log entry: mood ${moodNum}/10, stress ${stressNum}/10, sleep ${sleepNum}h`,
    moodScore: moodNum,
    stressScore: stressNum,
    sleepHours: sleepNum
  });

  if (typeof onCacheInvalidate === 'function') {
    onCacheInvalidate(userId);
  }

  return doc;
}

/**
 * Returns the full MoodLog history for a user, newest first.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
async function getMoodHistory(userId) {
  return MoodLog.find({ userId }).sort({ date: -1 }).lean();
}

module.exports = { createMoodEntry, getMoodEntries, logMoodEntry, getMoodHistory };
