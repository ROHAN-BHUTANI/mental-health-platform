const express = require("express");
const mongoose = require("mongoose");
const MoodLog = require("../models/MoodLog");

const router = express.Router();

// Health check
router.get("/health", (req, res) => res.json({ status: "ok", service: "server" }));

// Database connectivity test with a read query
router.get("/test-db", async (_req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(503).json({ status: "error", message: "Database not connected" });
    }
    // Ping and sample read
    await mongoose.connection.db.admin().ping();
    const sample = await MoodLog.findOne().lean();
    return res.json({ status: "ok", message: "Database reachable and queries working", sample });
  } catch (err) {
    console.error("DB test failed:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Database not reachable or query failed"
    });
  }
});

module.exports = router;
