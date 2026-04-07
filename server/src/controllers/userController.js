const User = require('../models/User');
const { ok, fail } = require('../utils/response');

exports.getProfile = async (req, res) => {
  try {
    return ok(res, {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        plan: req.user.plan,
        subscriptionStatus: req.user.subscriptionStatus,
        stripeCustomerId: req.user.stripeCustomerId
      }
    });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = String(req.body.name).trim();
    if (req.body.email) updates.email = String(req.body.email).trim().toLowerCase();

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password -refreshTokenHash');

    return ok(res, { user: updated });
  } catch (error) {
    if (error?.code === 11000) {
      return fail(res, 409, 'Email already in use');
    }
    return fail(res, 500, error.message);
  }
};

exports.getSubscription = async (req, res) => {
  try {
    return ok(res, {
      subscription: {
        plan: req.user.plan,
        status: req.user.subscriptionStatus,
        stripeCustomerId: req.user.stripeCustomerId,
        isPremium: req.user.plan === 'premium'
      }
    });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const plan = req.body.plan;
    const status = plan === 'premium' ? 'active' : 'inactive';

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        plan,
        subscriptionStatus: status,
        stripeCustomerId: req.body.stripeCustomerId || req.user.stripeCustomerId || null
      },
      { new: true, runValidators: true }
    ).select('-password -refreshTokenHash');

    return ok(res, {
      message: 'Subscription updated',
      subscription: {
        plan: updated.plan,
        status: updated.subscriptionStatus,
        stripeCustomerId: updated.stripeCustomerId,
        isPremium: updated.plan === 'premium'
      }
    });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};