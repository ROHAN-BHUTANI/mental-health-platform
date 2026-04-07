const ok = (res, payload = {}, status = 200) => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return res.status(status).json({ success: true, data: payload, ...payload });
  }

  if (Array.isArray(payload)) {
    return res.status(status).json({ success: true, data: payload, items: payload });
  }

  return res.status(status).json({ success: true, data: payload });
};

const fail = (res, status = 500, message = "Unexpected error", details) => {
  return res.status(status).json({
    success: false,
    error: {
      message,
      ...(details ? { details } : {})
    },
    message
  });
};

module.exports = { ok, fail };
