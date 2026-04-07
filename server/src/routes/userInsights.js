const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getInsights, getAnalytics } = require("../controllers/insightController");
const { getProfile, updateProfile, getSubscription, updateSubscription } = require("../controllers/userController");
const { validate } = require("../middleware/validate");
const { userProfileUpdateSchema, subscriptionUpdateSchema } = require("../validation/schemas");
const { requirePlan } = require("../middleware/featureGate");

// GET /api/user/insights
router.get("/insights", auth, getInsights);

// GET /api/user/analytics
router.get("/analytics", auth, getAnalytics);

// GET /api/user/profile
router.get("/profile", auth, getProfile);

// PATCH /api/user/profile
router.patch("/profile", auth, validate(userProfileUpdateSchema), updateProfile);

// GET /api/user/subscription
router.get("/subscription", auth, getSubscription);

// PATCH /api/user/subscription
router.patch("/subscription", auth, validate(subscriptionUpdateSchema), updateSubscription);

// Example premium-gated route to support frontend feature gating checks.
router.get("/premium-check", auth, requirePlan("premium"), (req, res) => {
	return res.status(200).json({ success: true, message: "Premium feature enabled" });
});

module.exports = router;
