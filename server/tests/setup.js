process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
// Increase rate limits for tests to avoid hitting the limit
process.env.RATE_LIMIT_AUTH_MAX = '1000';
process.env.RATE_LIMIT_ML_MAX = '1000';
process.env.RATE_LIMIT_CHAT_MAX = '1000';
