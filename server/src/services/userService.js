'use strict';

/**
 * @module userService
 * @description Handles user profile and subscription management.
 * Thin wrapper over the User model; keeps controllers free of DB logic.
 */

const User = require('../models/User');

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

/**
 * Returns the serialised public profile from the authenticated user object.
 * (No DB hit needed — `req.user` is already populated by the auth middleware.)
 * @param {object} user  - `req.user` shape
 * @returns {object}
 */
function getPublicProfile(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    stripeCustomerId: user.stripeCustomerId
  };
}

/**
 * Updates mutable profile fields and returns the refreshed document.
 * @param {string} userId
 * @param {{ name?: string, email?: string }} updates
 * @returns {Promise<object>} updated user document (password fields stripped)
 * @throws {Error} with `statusCode` on duplicate email (409)
 */
async function updateProfile(userId, { name, email } = {}) {
  const updates = {};
  if (name) updates.name = String(name).trim();
  if (email) updates.email = String(email).trim().toLowerCase();

  try {
    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true
    }).select('-password -refreshTokenHash');

    return updated;
  } catch (error) {
    if (error?.code === 11000) {
      const err = new Error('Email already in use');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

/**
 * Returns the subscription summary derived from `req.user`.
 * @param {object} user - `req.user` shape
 * @returns {object}
 */
function getSubscriptionSummary(user) {
  return {
    plan: user.plan,
    status: user.subscriptionStatus,
    stripeCustomerId: user.stripeCustomerId,
    isPremium: user.plan === 'premium'
  };
}

/**
 * Updates the user's subscription plan and status.
 * @param {string} userId
 * @param {{ plan: string, stripeCustomerId?: string }} data
 * @param {string} existingStripeId  - falls back to the current stored value
 * @returns {Promise<object>} subscription summary
 */
async function updateSubscription(userId, { plan, stripeCustomerId }, existingStripeId) {
  const status = plan === 'premium' ? 'active' : 'inactive';

  const updated = await User.findByIdAndUpdate(
    userId,
    { plan, subscriptionStatus: status, stripeCustomerId: stripeCustomerId || existingStripeId || null },
    { new: true, runValidators: true }
  ).select('-password -refreshTokenHash');

  return {
    plan: updated.plan,
    status: updated.subscriptionStatus,
    stripeCustomerId: updated.stripeCustomerId,
    isPremium: updated.plan === 'premium'
  };
}

module.exports = { getPublicProfile, updateProfile, getSubscriptionSummary, updateSubscription };
