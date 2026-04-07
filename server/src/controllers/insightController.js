const mongoose = require("mongoose");
const MoodLog = require("../models/MoodLog");
const mlClient = require("../utils/mlClient");
const { generateRecommendations } = require("../utils/recommendationEngine");
const { computeScore } = require("../utils/healthScore");
const { ok, fail } = require("../utils/response");

const analyticsCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, digits = 1) => Number((Number(value) || 0).toFixed(digits));
const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + (Number(value) || 0), 0) / values.length;
}

function summarizeSeries(series) {
  return {
    entryCount: series.length,
    avgMood: round(average(series.map((item) => item.mood)), 1),
    avgStress: round(average(series.map((item) => item.stress)), 1),
    avgSleep: round(average(series.map((item) => item.sleep)), 1)
  };
}

function compareSeries(currentSeries, previousSeries) {
  const current = summarizeSeries(currentSeries);
  const previous = summarizeSeries(previousSeries);
  return {
    current,
    previous,
    deltaMood: round(current.avgMood - previous.avgMood, 1),
    deltaStress: round(current.avgStress - previous.avgStress, 1),
    deltaSleep: round(current.avgSleep - previous.avgSleep, 1)
  };
}

function computeStreak(sortedDescendingLogs) {
  if (!sortedDescendingLogs.length) return 0;

  let streak = 1;
  let previousDate = new Date(sortedDescendingLogs[0].date);
  previousDate.setHours(0, 0, 0, 0);

  for (let index = 1; index < sortedDescendingLogs.length; index += 1) {
    const currentDate = new Date(sortedDescendingLogs[index].date);
    currentDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((previousDate - currentDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1;
      previousDate = currentDate;
      continue;
    }

    break;
  }

  return streak;
}

function pearsonCorrelation(xs, ys) {
  const filtered = xs
    .map((x, index) => [Number(x), Number(ys[index])])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

  if (filtered.length < 2) return 0;

  const xValues = filtered.map(([x]) => x);
  const yValues = filtered.map(([, y]) => y);
  const xMean = average(xValues);
  const yMean = average(yValues);

  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;

  filtered.forEach(([x, y]) => {
    const xDelta = x - xMean;
    const yDelta = y - yMean;
    numerator += xDelta * yDelta;
    xDenominator += xDelta * xDelta;
    yDenominator += yDelta * yDelta;
  });

  if (!xDenominator || !yDenominator) return 0;

  return clamp(numerator / Math.sqrt(xDenominator * yDenominator), -1, 1);
}

function classifyEmotion(mood, stress, sleep) {
  if (mood >= 8 && stress <= 4 && sleep >= 7) return "Calm";
  if (mood >= 6 && stress <= 6) return "Balanced";
  if (mood >= 4 || sleep >= 7) return "Uneasy";
  return "At Risk";
}

function classifyActivityImpact(mood, stress, sleep) {
  if (stress >= 8 || sleep < 6) return "Overload";
  if (mood >= 8 && stress <= 5) return "Momentum";
  if (sleep >= 8 && stress <= 4) return "Recovery";
  return "Routine";
}

function buildDistribution(logs, classifier, labels) {
  const counts = labels.reduce((accumulator, label) => {
    accumulator[label] = 0;
    return accumulator;
  }, {});

  logs.forEach((log) => {
    const label = classifier(log.mood, log.stress, log.sleep);
    counts[label] = (counts[label] || 0) + 1;
  });

  return labels.map((label) => ({ name: label, value: counts[label] || 0 }));
}

function buildDailySeries(logs) {
  const grouped = new Map();

  logs.forEach((log) => {
    const key = dayKey(log.date);
    const bucket = grouped.get(key) || {
      date: key,
      moodValues: [],
      stressValues: [],
      sleepValues: [],
      entries: []
    };

    bucket.moodValues.push(Number(log.mood) || 0);
    bucket.stressValues.push(Number(log.stress) || 0);
    bucket.sleepValues.push(Number(log.sleep) || 0);
    bucket.entries.push(log);
    grouped.set(key, bucket);
  });

  return Array.from(grouped.values())
    .map((bucket) => ({
      date: bucket.date,
      mood: round(average(bucket.moodValues), 1),
      stress: round(average(bucket.stressValues), 1),
      sleep: round(average(bucket.sleepValues), 1),
      entries: bucket.entries.length
    }))
    .sort((left, right) => new Date(left.date) - new Date(right.date));
}

function buildRiskLevel(score, trend, predictedFutureRisk) {
  const elevated = Number(predictedFutureRisk) || 0;

  if (score < 40 || elevated >= 0.7 || trend === "increasing") return "High";
  if (score < 70 || elevated >= 0.45) return "Moderate";
  return "Low";
}

function buildSuggestion(status, recommendationList, latestEntry) {
  if (status === "High Risk") {
    return "Pause today, reduce commitments, and use one grounding exercise before your next task.";
  }

  if (Array.isArray(recommendationList) && recommendationList.length) {
    return recommendationList[0];
  }

  if (latestEntry) {
    return "Keep building on the routine that produced your latest stable entry.";
  }

  return "Check in tomorrow to keep your trend data current.";
}

function getCache(userId) {
  const cacheEntry = analyticsCache.get(String(userId));
  if (!cacheEntry) return null;

  if (cacheEntry.expiresAt <= Date.now()) {
    analyticsCache.delete(String(userId));
    return null;
  }

  return cacheEntry.value;
}

function setCache(userId, value) {
  analyticsCache.set(String(userId), {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

function invalidateAnalyticsCache(userId) {
  if (!userId) return;
  analyticsCache.delete(String(userId));
}

function buildEmptyPayload(user) {
  return {
    user: {
      id: user?._id,
      name: user?.name || ""
    },
    totalEntries: 0,
    avgMood: 0,
    avgStress: 0,
    avgSleep: 0,
    streak_count: 0,
    lastMoodEntry: null,
    emotionalStabilityScore: 100,
    riskLevel: "Low",
    aiSuggestionOfDay: "Create your first mood log to unlock personalized analytics.",
    confidence: 0,
    score: 100,
    status: "Stable",
    recommendations: [],
    insights: "No entries yet. Start logging daily to generate trend insights.",
    summary: {
      weeklyInsights: {
        current: { entryCount: 0, avgMood: 0, avgStress: 0, avgSleep: 0 },
        previous: { entryCount: 0, avgMood: 0, avgStress: 0, avgSleep: 0 },
        deltaMood: 0,
        deltaStress: 0,
        deltaSleep: 0
      },
      monthlyInsights: {
        current: { entryCount: 0, avgMood: 0, avgStress: 0, avgSleep: 0 },
        previous: { entryCount: 0, avgMood: 0, avgStress: 0, avgSleep: 0 },
        deltaMood: 0,
        deltaStress: 0,
        deltaSleep: 0
      }
    },
    charts: {
      moodTrend: [],
      stressTrend: [],
      emotionDistribution: [],
      activityImpact: []
    },
    recentEntries: [],
    ml: {}
  };
}

async function buildAnalyticsPayload(user) {
  const cacheKey = user?._id;
  const cachedPayload = getCache(cacheKey);
  if (cachedPayload) {
    return cachedPayload;
  }

  const userId = new mongoose.Types.ObjectId(String(cacheKey));
  const logs = await MoodLog.find({ userId }).sort({ date: 1 }).lean();

  if (!logs.length) {
    const emptyPayload = buildEmptyPayload(user);
    setCache(cacheKey, emptyPayload);
    return emptyPayload;
  }

  const dailySeries = buildDailySeries(logs);
  const totalEntries = logs.length;
  const latestEntry = logs[logs.length - 1];
  const recentEntries = logs.slice(-5).reverse();
  const streakCount = computeStreak([...logs].reverse());

  const weeklySeries = dailySeries.slice(-7);
  const previousWeeklySeries = dailySeries.slice(Math.max(0, dailySeries.length - 14), Math.max(0, dailySeries.length - 7));
  const monthlySeries = dailySeries.slice(-30);
  const previousMonthlySeries = dailySeries.slice(Math.max(0, dailySeries.length - 60), Math.max(0, dailySeries.length - 30));

  const weeklyInsights = compareSeries(weeklySeries, previousWeeklySeries);
  const monthlyInsights = compareSeries(monthlySeries, previousMonthlySeries);

  const moodValues = logs.map((log) => Number(log.mood) || 0);
  const stressValues = logs.map((log) => Number(log.stress) || 0);
  const sleepValues = logs.map((log) => Number(log.sleep) || 0);

  const moodTrend = dailySeries.map((item) => ({
    date: item.date,
    mood: item.mood,
    stress: item.stress,
    sleep: item.sleep,
    entries: item.entries
  }));

  const stressTrend = dailySeries.map((item) => ({
    date: item.date,
    value: item.stress
  }));

  const emotionDistribution = buildDistribution(
    logs,
    classifyEmotion,
    ["Calm", "Balanced", "Uneasy", "At Risk"]
  );

  const activityImpact = buildDistribution(
    logs,
    classifyActivityImpact,
    ["Recovery", "Routine", "Momentum", "Overload"]
  );

  const sleepMoodCorrelation = round(pearsonCorrelation(moodValues, sleepValues), 2);
  const stressVolatility = round(
    average(dailySeries.slice(1).map((item, index) => Math.abs(item.stress - dailySeries[index].stress))),
    2
  );
  const moodVolatility = round(
    average(dailySeries.slice(1).map((item, index) => Math.abs(item.mood - dailySeries[index].mood))),
    2
  );

  let mlData = {};
  try {
    const sentimentHistory = logs.slice(-7).map((entry) => Number(entry.mood) || 0);
    const stressHistory = logs.slice(-7).map((entry) => Number(entry.stress) || 0);
    const response = await mlClient.post("/analyze", {
      text: latestEntry?.text || "",
      historyScores: sentimentHistory,
      stressHistory
    });
    mlData = response.data || {};
  } catch (error) {
    mlData = {};
  }

  const burnout = mlData.burnout || {};
  const predictedFutureRisk = Number(mlData.predictedFutureRisk ?? burnout.risk_score ?? 0);
  const burnoutTrend = mlData.stressTrend?.trend || burnout.trend || "stable";
  const alertMessage = burnout.alert_message || "Your trend looks steady. Keep going.";
  const averageMood = average(moodValues);
  const averageStress = average(stressValues);
  const averageSleep = average(sleepValues);

  const healthScore = computeScore({
    risk_score: predictedFutureRisk,
    avg_stress: averageStress,
    avg_sleep: averageSleep
  });

  const recommendationsPayload = generateRecommendations({
    risk_score: predictedFutureRisk,
    trend: burnoutTrend,
    avg_sleep: averageSleep,
    latest_stress: latestEntry?.stress || averageStress
  });

  const emotionalStabilityScore = clamp(
    Math.round(100 - ((moodVolatility * 10) + (stressVolatility * 8) + (Math.abs(sleepMoodCorrelation) * 5))),
    0,
    100
  );

  const riskLevel = buildRiskLevel(healthScore.score, burnoutTrend, predictedFutureRisk);
  const aiSuggestionOfDay = buildSuggestion(
    recommendationsPayload.status,
    recommendationsPayload.recommendations,
    latestEntry
  );

  const summary = {
    weeklyInsights,
    monthlyInsights,
    sleepMoodCorrelation,
    moodVolatility,
    stressVolatility,
    avgMood: round(averageMood, 1),
    avgStress: round(averageStress, 1),
    avgSleep: round(averageSleep, 1)
  };

  const analyticsPayload = {
    user: {
      id: user?._id,
      name: user?.name || ""
    },
    totalEntries,
    avgMood: summary.avgMood,
    avgStress: summary.avgStress,
    avgSleep: summary.avgSleep,
    streak_count: streakCount,
    lastMoodEntry: latestEntry
      ? {
          date: latestEntry.date,
          mood: latestEntry.mood,
          stress: latestEntry.stress,
          sleep: latestEntry.sleep
        }
      : null,
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
    summary,
    charts: {
      moodTrend,
      stressTrend,
      emotionDistribution,
      activityImpact
    },
    recentEntries
  };

  setCache(cacheKey, analyticsPayload);
  return analyticsPayload;
}

exports.getAnalytics = async (req, res) => {
  try {
    const user = req.user;
    if (!user?._id) {
      return fail(res, 401, "Unauthorized");
    }

    const analytics = await buildAnalyticsPayload(user);
    return ok(res, analytics);
  } catch (error) {
    console.error("getAnalytics error:", error?.message || error);
    return fail(res, 500, error.message);
  }
};

exports.getInsights = async (req, res) => {
  try {
    const user = req.user;
    if (!user?._id) {
      return fail(res, 401, "Unauthorized");
    }

    const analytics = await buildAnalyticsPayload(user);
    return ok(res, {
      risk_score: analytics.burnout?.risk_score ?? 0,
      trend: analytics.burnout?.trend || "stable",
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
    console.error("getInsights error:", error?.message || error);
    return fail(res, 500, error.message);
  }
};

exports.invalidateAnalyticsCache = invalidateAnalyticsCache;