'use strict';

/**
 * @module authService
 * @description Encapsulates all authentication business logic — token generation,
 * password hashing, user creation, and session management.
 * Controllers remain thin and delegate entirely to this service.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

/**
 * Issues a short-lived access token.
 * @param {string} userId
 * @returns {string} signed JWT
 */
const createAccessToken = (userId) =>
  jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

/**
 * Issues a long-lived refresh token bound to a version counter (rotation guard).
 * @param {string} userId
 * @param {number} tokenVersion
 * @returns {string} signed JWT
 */
const createRefreshToken = (userId, tokenVersion) =>
  jwt.sign(
    { id: userId, type: 'refresh', tokenVersion, jti: crypto.randomUUID() },
    getRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

/**
 * Shapes the response payload returned after successful auth operations.
 * @param {object} user - Mongoose user document
 * @param {string} accessToken
 * @param {string} refreshToken
 * @returns {object}
 */
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

// ---------------------------------------------------------------------------
// Exported service methods
// ---------------------------------------------------------------------------

/**
 * Registers a new user and returns a token payload.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<object>} auth payload
 * @throws {Error} with a `statusCode` property on predictable failures
 */
async function register({ name, email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('User already exists');
    err.statusCode = 409;
    throw err;
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
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return { message: 'User registered successfully', ...buildAuthPayload(user, accessToken, refreshToken) };
}

/**
 * Authenticates a user by credentials and returns a token payload.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<object>} auth payload
 * @throws {Error} with a `statusCode` property on predictable failures
 */
async function login({ email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const err = new Error('User not registered');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Incorrect password');
    err.statusCode = 401;
    throw err;
  }

  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id, user.refreshTokenVersion);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  user.lastLoginAt = new Date();
  await user.save();

  return buildAuthPayload(user, accessToken, refreshToken);
}

/**
 * Rotates tokens using a valid refresh token.
 * @param {string} refreshToken
 * @returns {Promise<object>} new auth payload
 * @throws {Error} on invalid/expired tokens
 */
async function refreshSession(refreshToken) {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, getRefreshSecret());
  } catch {
    const err = new Error('Refresh token expired or invalid');
    err.statusCode = 401;
    throw err;
  }

  if (decoded.type !== 'refresh') {
    const err = new Error('Invalid refresh token');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokenHash) {
    const err = new Error('Refresh token not recognized');
    err.statusCode = 401;
    throw err;
  }

  if (Number(decoded.tokenVersion || -1) !== Number(user.refreshTokenVersion || 0)) {
    const err = new Error('Refresh token version mismatch');
    err.statusCode = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isValid) {
    const err = new Error('Refresh token mismatch');
    err.statusCode = 401;
    throw err;
  }

  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  const nextAccessToken = createAccessToken(user._id);
  const nextRefreshToken = createRefreshToken(user._id, user.refreshTokenVersion);
  user.refreshTokenHash = await bcrypt.hash(nextRefreshToken, 10);
  await user.save();

  return buildAuthPayload(user, nextAccessToken, nextRefreshToken);
}

/**
 * Invalidates the stored refresh token hash (idempotent).
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
async function logout(refreshToken) {
  if (!refreshToken) return;

  try {
    const decoded = jwt.verify(refreshToken, getRefreshSecret());
    await User.findByIdAndUpdate(decoded.id, {
      refreshTokenHash: null,
      $inc: { refreshTokenVersion: 1 }
    });
  } catch {
    // Logout is always idempotent — expired/invalid tokens are silently ignored.
  }
}

module.exports = { register, login, refreshSession, logout };
