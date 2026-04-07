const mongoose = require("mongoose");

const MoodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mood: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    stress: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    sleep: {
      type: Number,
      min: 0,
      max: 24,
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Ensure one log per user per date if desired; comment out if multiple per day are allowed
MoodLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("MoodLog", MoodLogSchema);
