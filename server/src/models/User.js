const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  plan: { type: String, enum: ['free', 'premium'], default: 'free', index: true },
  subscriptionStatus: {
    type: String,
    enum: ['inactive', 'trialing', 'active', 'past_due', 'canceled'],
    default: 'inactive',
    index: true
  },
  stripeCustomerId: { type: String, default: null },
  refreshTokenHash: { type: String, default: null },
  refreshTokenVersion: { type: Number, default: 0 },
  lastLoginAt: { type: Date, default: null }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
