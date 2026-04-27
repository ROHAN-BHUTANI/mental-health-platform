const mongoose = require("mongoose");

const MoodEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  moodScore: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  stressScore: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24,
    required: true
  },
  sentimentLabel: String,
  sentimentScore: Number,
  depressionProbability: Number,
  confidence: Number,

  volatility: Number,
  trendSlope: Number,
  anomalyDetected: Boolean,
  predictedFutureRisk: Number

}, { timestamps: true });

// Optimize analytics and research aggregation queries
MoodEntrySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("MoodEntry", MoodEntrySchema);
