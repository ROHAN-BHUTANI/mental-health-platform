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

    // If date is provided as YYYY-MM-DD, preserve the selected day but stamp current time
    // so multiple logs on the same day are stored as separate entries.
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const now = new Date();
      dateVal.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    }

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

    const doc = await MoodLog.create({
      userId,
      mood: moodNum,
      stress: stressNum,
      sleep: sleepNum,
      date: dateVal
    });

    invalidateAnalyticsCache(userId);

    return ok(res, doc, 201);
  } catch (err) {
    console.error("logMood error:", err);
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
