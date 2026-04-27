import React from "react";
import { motion } from "framer-motion";

const statusStyles = {
  "High Risk": { color: "#ef4444", bg: "rgba(239,68,68,0.15)", icon: "⚠️" },
  Moderate: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", icon: "⚡" },
  Stable: { color: "#10b981", bg: "rgba(16,185,129,0.15)", icon: "✨" }
};

export default function InsightsCard({
  status,
  insight,
  recommendations,
  aiSuggestion,
  riskLevel,
  emotionalStabilityScore,
  confidence,
  summary = {}
}) {
  const style = statusStyles[status] || statusStyles.Stable;

  const diagnostics = [
    { label: "Mood Drift", val: summary.moodVolatility || 2.4, weight: "Primary" },
    { label: "Stress Load", val: summary.stressVolatility || 1.8, weight: "Critical" },
    { label: "Sleep Link", val: summary.sleepMoodCorrelation || 0.65, weight: "Strong" }
  ];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={styles.card}
    >
      <div style={styles.header}>
        <div style={{ ...styles.badge, color: style.color, background: style.bg }}>
          {style.icon} System Status: {status || "Stable"}
        </div>
        <div style={styles.confidence}>
          Confidence Index: {Math.round((Number(confidence) || 0) * 100)}%
        </div>
      </div>

      <div className="insights-content-grid" style={styles.contentGrid}>
        <div style={styles.insightColumn}>
          <div style={styles.sectionLabel}>The "Why" (Diagnostic)</div>
          <h3 style={styles.insightText}>
            {insight || "Analyzing your behavioral baseline to generate high-fidelity insights."}
          </h3>
          
          <div style={styles.diagnosticGrid}>
            {diagnostics.map((d) => (
              <div key={d.label} style={styles.diagItem}>
                <div style={styles.diagHeader}>
                  <span style={styles.diagLabel}>{d.label}</span>
                  <span style={styles.diagWeight}>{d.weight}</span>
                </div>
                <div style={styles.diagValue}>{d.val.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.actionColumn}>
          <div style={styles.sectionLabel}>The "What" (Resolution)</div>
          <div style={styles.actionsGrid}>
            {(recommendations || []).slice(0, 3).map((rec, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={styles.actionCard}
              >
                <div style={styles.actionIcon}>🎯</div>
                <div style={styles.actionText}>{rec}</div>
              </motion.div>
            ))}
            {(!recommendations || recommendations.length === 0) && (
              <div style={styles.emptyAction}>Calibrating recommendations based on your next log...</div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.footerNote}>
          <strong>Intelligent Correlation:</strong> {status === 'High Risk' ? 
            "Your stress load has bypassed critical thresholds, impacting neural recovery." : 
            "Behavioral metrics indicate a stable equilibrium between cognitive load and rest cycles."
          }
        </div>
      </div>
    </motion.div>
  );
}

const styles = {
  card: {
    padding: "32px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.4)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px"
  },
  badge: {
    padding: "8px 16px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.1em"
  },
  confidence: {
    fontSize: "10px",
    color: "#475569",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "40px"
  },
  insightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 900,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.1em"
  },
  insightText: {
    fontSize: "24px",
    lineHeight: 1.35,
    margin: 0,
    color: "#f8fafc",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700
  },
  diagnosticGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginTop: "12px"
  },
  diagItem: {
    padding: "16px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.04)"
  },
  diagHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px"
  },
  diagLabel: { fontSize: "9px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" },
  diagWeight: { fontSize: "8px", color: "#3b82f6", fontWeight: 800 },
  diagValue: { fontSize: "16px", fontWeight: 800, color: "#f1f5f9" },
  actionColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  actionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  actionCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "rgba(34,211,238,0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(34,211,238,0.1)"
  },
  actionIcon: { fontSize: "14px" },
  actionText: { fontSize: "13px", color: "#cbd5e1", fontWeight: 600 },
  emptyAction: { fontSize: "12px", color: "#475569", fontStyle: "italic" },
  footer: {
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid rgba(255,255,255,0.05)"
  },
  footerNote: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.5
  }
};
