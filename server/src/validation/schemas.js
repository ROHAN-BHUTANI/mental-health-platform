const Joi = require("joi");

const authRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required()
});

const authLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required()
});

const authRefreshSchema = Joi.object({
  refreshToken: Joi.string().min(20).required()
});

const moodEntrySchema = Joi.object({
  text: Joi.string().trim().min(2).max(2000).required(),
  moodScore: Joi.number().min(1).max(10).required(),
  stressScore: Joi.number().min(1).max(10).required(),
  sleepHours: Joi.number().min(0).max(24).required()
});

const moodLogSchema = Joi.object({
  mood: Joi.number().min(1).max(10).required(),
  stress: Joi.number().min(1).max(10).required(),
  sleep: Joi.number().min(0).max(24).required(),
  date: Joi.date().iso().optional()
});

const chatSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required(),
  history: Joi.array().items(
    Joi.object({
      role: Joi.string().valid("user", "assistant").required(),
      content: Joi.string().max(3000).required()
    })
  ).default([])
});

const mlPredictSchema = Joi.object({
  text: Joi.string().allow("").max(4000).default(""),
  historyScores: Joi.array().items(Joi.number()).default([]),
  stressHistory: Joi.array().items(Joi.number()).default([])
}).or("text", "stressHistory");

const userProfileUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email().optional()
}).or("name", "email");

const subscriptionUpdateSchema = Joi.object({
  plan: Joi.string().valid("free", "premium").required(),
  stripeCustomerId: Joi.string().allow(null, "").optional()
});

module.exports = {
  authRegisterSchema,
  authLoginSchema,
  authRefreshSchema,
  moodEntrySchema,
  moodLogSchema,
  chatSchema,
  mlPredictSchema,
  userProfileUpdateSchema,
  subscriptionUpdateSchema
};
