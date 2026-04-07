import React from "react";
import { motion } from "framer-motion";

export default function StreakCard({ streak = 0 }) {
  const highlight = streak >= 7 ? "#f97316" : "#22d3ee";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="card"
      style={{
        padding: "18px",
        background: "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(34,211,238,0.16))",
        border: "1px solid rgba(255,255,255,0.14)",
        borderLeft: "3px solid rgba(249,115,22,0.58)",
        boxShadow: "0 14px 28px rgba(2,6,23,0.28), 0 24px 58px rgba(2,6,23,0.36)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>🔥</span>
        <div>
          <div style={{ fontSize: 14, color: "#dce6f5" }}>Streak</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: highlight }}>
            {streak} day{streak === 1 ? "" : "s"}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, color: "#dce6f5" }}>
        Keep logging daily to grow your streak!
      </div>
    </motion.div>
  );
}
