const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ok, fail } = require('../utils/response');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const createAccessToken = (userId) => jwt.sign(
  { id: userId, type: 'access' },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const createRefreshToken = (userId, tokenVersion) => jwt.sign(
  { id: userId, type: 'refresh', tokenVersion, jti: crypto.randomUUID() },
  getRefreshSecret(),
  { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
);

const buildAuthPayload = (user, accessToken, refreshToken) => ({
  token: accessToken,
  accessToken,
  refreshToken,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus
  }
});

// =====================
// REGISTER
// =====================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim() || !email || !password) {
      return fail(res, 400, 'Name, email and password required');
    }

    if (!isValidEmail(email)) {
      return fail(res, 400, 'Please provide a valid email address');
    }

    if (String(password).length < 8) {
      return fail(res, 400, 'Password must be at least 8 characters');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return fail(res, 409, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    user.refreshTokenVersion = 1;
    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id, user.refreshTokenVersion);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return ok(res, {
      message: 'User registered successfully',
      ...buildAuthPayload(user, accessToken, refreshToken)
    }, 201);

  } catch (error) {
    console.error('Register error:', error);
    return fail(res, 500, error.message);
  }
};

// =====================
// LOGIN
// =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return fail(res, 400, 'Email and password required');
    }

    if (!isValidEmail(email)) {
      return fail(res, 400, 'Please provide a valid email address');
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) {
      return fail(res, 404, 'User not registered');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return fail(res, 401, 'Incorrect password');
    }

    user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id, user.refreshTokenVersion);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = refreshTokenHash;
    user.lastLoginAt = new Date();
    await user.save();

    return ok(res, buildAuthPayload(user, accessToken, refreshToken), 200);

  } catch (error) {
    console.error('Login error:', error);
    return fail(res, 500, error.message);
  }
};

// =====================
// PROFILE
// =====================
exports.profile = async (req, res) => {
  try {
    return ok(res, { user: req.user });
  } catch (error) {
    console.error('Profile error:', error);
    return fail(res, 500, error.message);
  }
};

// =====================
// REFRESH
// =====================
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return fail(res, 400, 'refreshToken is required');
    }

    const decoded = jwt.verify(refreshToken, getRefreshSecret());
    if (decoded.type !== 'refresh') {
      return fail(res, 401, 'Invalid refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokenHash) {
      return fail(res, 401, 'Refresh token not recognized');
    }

    if (Number(decoded.tokenVersion || -1) !== Number(user.refreshTokenVersion || 0)) {
      return fail(res, 401, 'Refresh token version mismatch');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      return fail(res, 401, 'Refresh token mismatch');
    }

    user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
    const nextAccessToken = createAccessToken(user._id);
    const nextRefreshToken = createRefreshToken(user._id, user.refreshTokenVersion);
    user.refreshTokenHash = await bcrypt.hash(nextRefreshToken, 10);
    await user.save();

    return ok(res, buildAuthPayload(user, nextAccessToken, nextRefreshToken));
  } catch (error) {
    return fail(res, 401, 'Refresh token expired or invalid');
  }
};

// =====================
// LOGOUT
// =====================
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return ok(res, { message: 'Logged out' });
    }

    try {
      const decoded = jwt.verify(refreshToken, getRefreshSecret());
      await User.findByIdAndUpdate(decoded.id, {
        refreshTokenHash: null,
        $inc: { refreshTokenVersion: 1 }
      });
    } catch (_ignore) {
      // no-op: logout remains idempotent
    }

    return ok(res, { message: 'Logged out' });
  } catch (error) {
    return fail(res, 500, error.message);
  }
};
