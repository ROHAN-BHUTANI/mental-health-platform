import React from "react";
import { motion } from "framer-motion";

const statusStyles = {
  "High Risk": { color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  Moderate: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  Stable: { color: "#22c55e", bg: "rgba(34,197,94,0.15)" }
};

export default function HealthScoreCard({ score = 0, status = "Stable" }) {
  const style = statusStyles[status] || statusStyles.Stable;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35 }}
      className="card"
      style={{
        background: "linear-gradient(135deg, rgba(14,165,233,0.18), rgba(139,92,246,0.16))",
        border: "1px solid rgba(255,255,255,0.14)",
        borderLeft: "3px solid rgba(34,211,238,0.62)",
        boxShadow: "0 14px 28px rgba(2,6,23,0.28), 0 24px 58px rgba(2,6,23,0.36)",
        padding: "20px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, color: "#f8fafc" }}>Mental Health Score</h3>
        <span
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            color: style.color,
            background: style.bg,
            border: `1px solid ${style.color}33`,
            fontWeight: 700
          }}
        >
          {status}
        </span>
      </div>
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          marginTop: 12,
          fontSize: "48px",
          fontWeight: 800,
          color: style.color,
          lineHeight: 1
        }}
      >
        {Number(score || 0).toFixed(0)}
      </motion.div>
      <p style={{ marginTop: 6, color: "#cbd5e1" }}>
        Higher is better. Calculated from burnout risk, stress, and sleep.
      </p>
    </motion.div>
  );
}
