/**
 * wellnessRoutes.js
 * API endpoints for prevention and research modules.
 */

const express = require("express");
const router = express.Router();
const preventionService = require("../services/preventionService");
const researchService = require("../services/researchService");

/**
 * @route GET /api/wellness/tip
 * @desc Get daily wellness tip
 */
router.get("/tip", async (req, res) => {
  try {
    const tip = await preventionService.getDailyTip();
    res.json(tip);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tip" });
  }
});

/**
 * @route GET /api/wellness/community-insights
 * @desc Get anonymized community trends
 */
router.get("/community-insights", async (req, res) => {
  try {
    const insights = await researchService.getCommunityInsights();
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch community insights" });
  }
});

module.exports = router;
