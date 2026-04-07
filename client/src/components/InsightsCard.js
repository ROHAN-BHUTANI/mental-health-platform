import React from "react";
import { motion } from "framer-motion";

const statusStyles = {
  "High Risk": { color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  Moderate: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  Stable: { color: "#22c55e", bg: "rgba(34,197,94,0.15)" }
};

export default function InsightsCard({
  status,
  insight,
  recommendations,
  aiSuggestion,
  riskLevel,
  emotionalStabilityScore,
  confidence
}) {
  const style = statusStyles[status] || statusStyles.Stable;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35 }}
      className="card"
      style={{
        background: "rgba(15,23,42,0.88)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderLeft: "3px solid rgba(99,102,241,0.62)",
        boxShadow: "0 14px 28px rgba(2,6,23,0.28), 0 24px 58px rgba(2,6,23,0.36)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, color: "#f8fafc" }}>Mental Health Insights</h2>
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            fontWeight: 700,
            color: style.color,
            background: style.bg,
            border: `1px solid ${style.color}33`
          }}
        >
          {status || "Stable"}
        </span>
      </div>

      {status === "High Risk" && (
        <div style={alertStyles.banner}>
          ⚠️ High burnout risk detected
        </div>
      )}

      <p style={{ color: "#dce6f5", marginTop: 12, marginBottom: 12 }}>{insight}</p>

      <div style={styles.metricsGrid}>
        <div style={styles.metricBox}>
          <span style={styles.metricLabel}>Risk Level</span>
          <strong style={{ color: style.color }}>{riskLevel || status || "Stable"}</strong>
        </div>
        <div style={styles.metricBox}>
          <span style={styles.metricLabel}>Stability</span>
          <strong>{Number(emotionalStabilityScore ?? 0).toFixed(0)} / 100</strong>
        </div>
        <div style={styles.metricBox}>
          <span style={styles.metricLabel}>Confidence</span>
          <strong>{Math.round((Number(confidence) || 0) * 100)}%</strong>
        </div>
      </div>

      {aiSuggestion && (
        <div style={styles.suggestionBox}>
          <div style={styles.metricLabel}>AI Suggestion of the Day</div>
          <div style={styles.suggestionText}>{aiSuggestion}</div>
        </div>
      )}

      <div>
        <h4 style={{ marginBottom: 8, color: "#f8fafc" }}>Recommended Actions</h4>
        <ul style={{ paddingLeft: 18, color: "#e2e8f0" }}>
          {(recommendations || []).map((rec, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>{rec}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

const alertStyles = {
  banner: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: "10px",
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#fecdd3"
  }
};

const styles = {
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
    marginTop: 16,
    marginBottom: 16
  },
  metricBox: {
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
  },
  metricLabel: {
    display: "block",
    fontSize: 12,
    color: "#b9c7dc",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.08em"
  },
  suggestionBox: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(167,139,250,0.18))",
    border: "1px solid rgba(148,163,184,0.2)"
  },
  suggestionText: {
    marginTop: 8,
    color: "#e2e8f0",
    lineHeight: 1.6
  }
};
