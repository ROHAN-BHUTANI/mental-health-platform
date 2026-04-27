'use strict';

/**
 * seedData.js
 * ~~~~~~~~~~~
 * Utility script to populate the database with 7 days of realistic 
 * mental health data for demo purposes.
 * 
 * Usage: node server/src/utils/seedData.js <YOUR_USER_ID>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MoodLog = require('../models/MoodLog');
const MoodEntry = require('../models/MoodEntry');

const userId = process.argv[2];

if (!userId) {
  console.error("❌ ERROR: Please provide your User ID. Usage: node seedData.js <userId>");
  process.exit(1);
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    // Clear existing data to avoid clutter during demo
    await MoodLog.deleteMany({ userId });
    await MoodEntry.deleteMany({ user: userId });

    const data = [
      { day: 6, mood: 4, stress: 8, sleep: 5, text: "Extremely overwhelmed with the project deadline. Didn't sleep well." },
      { day: 5, mood: 5, stress: 7, sleep: 6, text: "Managed to get some work done but anxiety is still high." },
      { day: 4, mood: 3, stress: 9, sleep: 4, text: "Terrible night. Heart racing and couldn't focus on anything today." },
      { day: 3, mood: 4, stress: 7, sleep: 6, text: "Trying to use breathing exercises. Stress is persistent." },
      { day: 2, mood: 6, stress: 5, sleep: 7, text: "Feeling slightly better after talking to a friend." },
      { day: 1, mood: 5, stress: 8, sleep: 5, text: "Work pressure increased again. Back to feeling on edge." },
      { day: 0, mood: 4, stress: 9, sleep: 4, text: "High anxiety today. I feel like I'm burning out." }
    ];

    for (const item of data) {
      const date = new Date();
      date.setDate(date.getDate() - item.day);

      // Create Analytics Log
      await MoodLog.create({
        userId,
        mood: item.mood,
        stress: item.stress,
        sleep: item.sleep,
        date
      });

      // Create Detailed Entry for ML
      await MoodEntry.create({
        user: userId,
        text: item.text,
        moodScore: item.mood,
        stressScore: item.stress,
        sleepHours: item.sleep,
        sentimentLabel: "negative",
        sentimentScore: 0.2,
        riskLevel: "High",
        createdAt: date
      });
    }

    console.log(`✅ SUCCESS: 7 days of demo data generated for User: ${userId}`);
    console.log("🚀 Your dashboard will now show active trends and triggers.");
    process.exit(0);
  } catch (err) {
    console.error("❌ SEED ERROR:", err);
    process.exit(1);
  }
};

seed();
