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

// Support multiple logs per day while keeping fast history queries.
MoodLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("MoodLog", MoodLogSchema);
