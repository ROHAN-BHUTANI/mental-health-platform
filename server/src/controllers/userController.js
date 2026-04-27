'use strict';

/**
 * @module userController
 * @description Thin request/response layer for user profile and subscription routes.
 * All business logic lives in `services/userService`.
 */

const userService = require('../services/userService');
const { ok, fail } = require('../utils/response');

/** GET /api/user/profile */
exports.getProfile = async (_req, res) => {
  try {
    const profile = userService.getPublicProfile(_req.user);
    return ok(res, { user: profile });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

/** PATCH /api/user/profile */
exports.updateProfile = async (req, res) => {
  try {
    const updated = await userService.updateProfile(req.user._id, req.body);
    return ok(res, { user: updated });
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message);
  }
};

/** GET /api/user/subscription */
exports.getSubscription = async (req, res) => {
  try {
    const subscription = userService.getSubscriptionSummary(req.user);
    return ok(res, { subscription });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

/** PATCH /api/user/subscription */
exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await userService.updateSubscription(
      req.user._id,
      req.body,
      req.user.stripeCustomerId
    );
    return ok(res, { message: 'Subscription updated', subscription });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};