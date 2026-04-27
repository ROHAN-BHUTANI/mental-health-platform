const normalize = (value) => {
  if (!value) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalize(item));
  }

  if (typeof value === "object" && typeof value.toObject === "function") {
    return value.toObject();
  }

  return value;
};

const ok = (res, payload = {}, status = 200) => {
  const normalizedPayload = normalize(payload);

  if (normalizedPayload && typeof normalizedPayload === "object" && !Array.isArray(normalizedPayload)) {
    return res.status(status).json({ success: true, data: normalizedPayload, ...normalizedPayload });
  }

  if (Array.isArray(normalizedPayload)) {
    return res.status(status).json({ success: true, data: normalizedPayload, items: normalizedPayload });
  }

  return res.status(status).json({ success: true, data: normalizedPayload });
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
