const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { logMood, getHistory } = require("../controllers/moodLogController");
const { validate } = require("../middleware/validate");
const { moodLogSchema } = require("../validation/schemas");

// POST /api/mood/log
router.post("/log", auth, validate(moodLogSchema), logMood);

// GET /api/mood/history
router.get("/history", auth, getHistory);

module.exports = router;
