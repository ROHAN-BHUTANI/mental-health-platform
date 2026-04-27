'use strict';

/**
 * @module authController
 * @description Thin request/response layer for authentication routes.
 * All business logic lives in `services/authService`.
 */

const authService = require('../services/authService');
const { ok, fail } = require('../utils/response');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/** POST /api/auth/register */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !String(name).trim() || !email || !password) {
      return fail(res, 400, 'Name, email and password required');
    }
    if (!isValidEmail(email)) return fail(res, 400, 'Please provide a valid email address');
    if (String(password).length < 8) return fail(res, 400, 'Password must be at least 8 characters');

    const payload = await authService.register({ name, email, password });
    return ok(res, payload, 201);
  } catch (error) {
    console.error('Register error:', error);
    return fail(res, error.statusCode || 500, error.message);
  }
};

/** POST /api/auth/login */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return fail(res, 400, 'Email and password required');
    if (!isValidEmail(email)) return fail(res, 400, 'Please provide a valid email address');

    const payload = await authService.login({ email, password });
    return ok(res, payload, 200);
  } catch (error) {
    console.error('Login error:', error);
    return fail(res, error.statusCode || 500, error.message);
  }
};

/** GET /api/auth/profile */
exports.profile = async (req, res) => {
  try {
    return ok(res, { user: req.user });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};

/** POST /api/auth/refresh */
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return fail(res, 400, 'refreshToken is required');

    const payload = await authService.refreshSession(refreshToken);
    return ok(res, payload);
  } catch (error) {
    return fail(res, error.statusCode || 401, error.message);
  }
};

/** POST /api/auth/logout */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    await authService.logout(refreshToken);
    return ok(res, { message: 'Logged out' });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};
