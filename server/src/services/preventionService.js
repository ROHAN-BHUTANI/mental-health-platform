/**
 * preventionService.js
 * Logic for proactive mental health prevention tools.
 */

const WELLNESS_TIPS = [
  { id: 1, text: "Try the 4-4-4 breathing technique for instant stress relief.", category: "exercise" },
  { id: 2, text: "Drinking a glass of water can significantly improve cognitive focus.", category: "health" },
  { id: 3, text: "Take 5 minutes to list three things you are grateful for today.", category: "mindset" },
  { id: 4, text: "A short walk in natural light can reset your circadian rhythm.", category: "activity" },
  { id: 5, text: "Reducing screen time an hour before bed improves sleep quality.", category: "sleep" }
];

/**
 * Get a randomized daily tip.
 */
const getDailyTip = async () => {
  const index = Math.floor(Math.random() * WELLNESS_TIPS.length);
  return WELLNESS_TIPS[index];
};

/**
 * Get configurations for specific breathing patterns.
 */
const getBreathingPatterns = async () => {
  return [
    { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4 },
    { name: "Calmness", inhale: 4, hold: 7, exhale: 8 },
    { name: "Power", inhale: 1, hold: 1, exhale: 1 }
  ];
};

module.exports = {
  getDailyTip,
  getBreathingPatterns
};
