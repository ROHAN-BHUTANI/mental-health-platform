/**
 * researchService.js
 * Logic for anonymized mental health data aggregation.
 */

const MoodEntry = require("../models/MoodEntry");
const User = require("../models/User");

/**
 * Get anonymized global mood trends.
 * Only aggregates data from users who have opted into research.
 */
const getCommunityInsights = async () => {
  try {
    // 1. Identify participants
    const participants = await User.find({ isResearchParticipant: true }).select("_id");
    const participantIds = participants.map(p => p._id);

    const MIN_PARTICIPANTS = 5;
    if (participantIds.length < MIN_PARTICIPANTS) {
      return {
        message: "Insufficient community data for insights (Min 5 contributors required).",
        averageMood: 0,
        averageStress: 0,
        sampleSize: participantIds.length
      };
    }

    // 2. Aggregate anonymized data (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await MoodEntry.aggregate([
      { 
        $match: { 
          user: { $in: participantIds },
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: null,
          avgMood: { $avg: "$moodScore" },
          avgStress: { $avg: "$stressScore" },
          avgSleep: { $avg: "$sleepHours" },
          totalEntries: { $sum: 1 }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        message: "No entries found in the last 7 days.",
        averageMood: 0,
        averageStress: 0,
        sampleSize: 0
      };
    }

    const { avgMood, avgStress, avgSleep, totalEntries } = stats[0];

    return {
      averageMood: parseFloat(avgMood.toFixed(2)),
      averageStress: parseFloat(avgStress.toFixed(2)),
      averageSleep: parseFloat(avgSleep.toFixed(2)),
      sampleSize: totalEntries,
      period: "Last 7 Days",
      trend: avgMood > 6 ? "Positive" : avgMood < 4 ? "Concern" : "Stable"
    };
  } catch (error) {
    console.error("Research aggregation error:", error);
    throw error;
  }
};

module.exports = {
  getCommunityInsights
};
