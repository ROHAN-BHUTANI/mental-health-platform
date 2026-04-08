const MoodEntry = require("../models/MoodEntry");
const MoodLog = require("../models/MoodLog");
const mlClient = require("../utils/mlClient");
const { ok, fail } = require("../utils/response");
const { invalidateAnalyticsCache } = require("./insightController");

exports.createMood = async (req, res) => {
  try {
    if (!req.user) {
      return fail(res, 401, "Unauthorized");
    }

    const { text, moodScore, stressScore, sleepHours } = req.body;

    if (!text || !text.trim()) {
      return fail(res, 400, "Mood text is required");
    }

    const mood = Number(moodScore);
    const stress = Number(stressScore);
    const sleep = Number(sleepHours);

    const isValidRange = (val, min, max) =>
      Number.isFinite(val) && val >= min && val <= max;

    if (!isValidRange(mood, 1, 10)) {
      return fail(res, 400, "moodScore must be between 1-10");
    }

    if (!isValidRange(stress, 1, 10)) {
      return fail(res, 400, "stressScore must be between 1-10");
    }

    if (!isValidRange(sleep, 0, 24)) {
      return fail(res, 400, "sleepHours must be between 0-24");
    }

    const userId = req.user._id;

    const previousMoods = await MoodEntry.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(7);

    const previousSentimentScores = previousMoods
      .map(mood => mood.sentimentScore || 0)
      .reverse();

    const previousStressScores = previousMoods
      .map(mood => mood.stressScore || 0)
      .reverse();

    let mlData = {};
    try {
      const mlResponse = await mlClient.post(
        `/analyze`,
        {
          text,
          historyScores: previousSentimentScores,
          stressHistory: previousStressScores
        }
      );
      mlData = mlResponse.data || {};
    } catch (mlError) {
      mlData = { ...mlClient.fallbackAnalyzePayload };
    }

    const moodEntry = await MoodEntry.create({
      user: userId,
      text,
      moodScore: mood,
      stressScore: stress,
      sleepHours: sleep,
      ...mlData
    });

    // Compatibility layer: append to MoodLog so each submission is preserved.
    await MoodLog.create({
      userId,
      mood,
      stress,
      sleep,
      date: new Date()
    });
    invalidateAnalyticsCache(userId);

    return ok(res, moodEntry.toObject ? moodEntry.toObject() : moodEntry, 201);

  } catch (error) {
    console.error("Mood creation error:", error);
    return fail(res, 500, error.message);
  }
};

exports.getMoods = async (req, res) => {
  try {
    if (!req.user) {
      return fail(res, 401, "Unauthorized");
    }

    const moods = await MoodEntry.find({ user: req.user._id })
      .sort({ createdAt: 1 });

    return ok(res, moods);

  } catch (error) {
    console.error("Fetch moods error:", error);
    return fail(res, 500, error.message);
  }
};
