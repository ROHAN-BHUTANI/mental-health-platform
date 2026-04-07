const { fail } = require("../utils/response");

function notFoundHandler(req, res) {
  return fail(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = status >= 500 ? "Internal server error" : err.message || "Request failed";

  if (process.env.NODE_ENV !== "production") {
    console.error("Unhandled error:", err);
  }

  return fail(res, status, message, err.details);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
