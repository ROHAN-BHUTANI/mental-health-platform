const MoodLog = require("../models/MoodLog");
const { ok, fail } = require("../utils/response");
const { invalidateAnalyticsCache } = require("./insightController");

// POST /api/mood/log
exports.logMood = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return fail(res, 401, "Unauthorized");

    const { mood, stress, sleep, date } = req.body;

    const moodNum = Number(mood);
    const stressNum = Number(stress);
    const sleepNum = Number(sleep);
    const dateVal = date ? new Date(date) : new Date();
    const dateKey = new Date(dateVal);
    dateKey.setHours(0, 0, 0, 0); // normalize to start of day for upsert

    const isValidRange = (val, min, max) =>
      Number.isFinite(val) && val >= min && val <= max;

    if (!isValidRange(moodNum, 1, 10)) {
      return fail(res, 400, "mood must be 1-10");
    }
    if (!isValidRange(stressNum, 1, 10)) {
      return fail(res, 400, "stress must be 1-10");
    }
    if (!isValidRange(sleepNum, 0, 24)) {
      return fail(res, 400, "sleep must be 0-24 hours");
    }

    const doc = await MoodLog.findOneAndUpdate(
      { userId, date: dateKey },
      { userId, mood: moodNum, stress: stressNum, sleep: sleepNum, date: dateKey },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    invalidateAnalyticsCache(userId);

    return ok(res, doc, 201);
  } catch (err) {
    console.error("logMood error:", err);
    if (err.code === 11000) {
      return fail(res, 409, "A log already exists for this date");
    }
    return fail(res, 500, err.message);
  }
};

// GET /api/mood/history
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return fail(res, 401, "Unauthorized");

    const logs = await MoodLog.find({ userId })
      .sort({ date: -1 })
      .lean();

    return ok(res, logs);
  } catch (err) {
    console.error("getHistory error:", err);
    return fail(res, 500, err.message);
  }
};
