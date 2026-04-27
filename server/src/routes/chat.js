const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { chat } = require("../controllers/chatController");
const { validate } = require("../middleware/validate");
const { chatSchema } = require("../validation/schemas");
const { chatLimiter } = require("../middleware/rateLimit");

router.post("/", auth, chatLimiter, validate(chatSchema), chat);

module.exports = router;
