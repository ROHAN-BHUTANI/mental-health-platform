const express = require("express");
const router = express.Router();
const { createMood, getMoods } = require("../controllers/moodController");
const auth = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { moodEntrySchema } = require("../validation/schemas");

router.post("/", auth, validate(moodEntrySchema), createMood);
router.get("/", auth, getMoods);

module.exports = router;
