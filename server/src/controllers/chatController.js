'use strict';

/**
 * @module chatController
 * @description Thin request/response layer for the AI chat route.
 * All business logic lives in `services/chatService`.
 */

const chatService = require('../services/chatService');
const { ok, fail } = require('../utils/response');

/** POST /api/chat */
exports.chat = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return fail(res, 401, 'Unauthorized');

    const { message, history } = req.body || {};

    const result = await chatService.processChat(user._id, message, history);
    return ok(res, result);
  } catch (error) {
    console.error('chat error:', error);
    return fail(res, error.statusCode || 500, error.message);
  }
};
