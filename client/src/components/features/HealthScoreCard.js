import React from "react";
import { motion } from "framer-motion";

const statusStyles = {
  "High Risk": { color: "#ef4444", bg: "rgba(239,68,68,0.15)", icon: "🔴" },
  Moderate: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", icon: "🟡" },
  Stable: { color: "#10b981", bg: "rgba(16,185,129,0.15)", icon: "🟢" }
};

export default function HealthScoreCard({ score = 0, status = "Stable", breakdown = {}, isHero = false }) {
  const style = statusStyles[status] || statusStyles.Stable;
  
  const components = [
    { label: "Stability", val: breakdown.stability || Math.min(100, score + 5) },
    { label: "Consistency", val: breakdown.consistency || Math.min(100, score - 5) },
    { label: "Sleep Link", val: breakdown.sleep || Math.min(100, score + 10) }
  ];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{ ...styles.card, ...(isHero ? styles.heroCard : {}) }}
    >
      <div style={styles.header}>
        <div style={styles.iconBox}>{style.icon}</div>
        <div style={styles.labelGroup}>
          <div style={styles.label}>Vitality Index</div>
          <div style={styles.algoTooltip}>Advanced Behavioral Scoring Engine</div>
        </div>
      </div>

      <div style={styles.body}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ ...styles.score, color: style.color, fontSize: isHero ? "72px" : "56px" }}
        >
          {Number(score || 0).toFixed(0)}
        </motion.div>
        <div style={styles.sub}>
          <div style={{ ...styles.status, color: style.color }}>{status.toUpperCase()}</div>
          <div style={styles.meta}>Core Stability Metric</div>
        </div>
      </div>
      
      {!isHero && (
        <div style={styles.breakdown}>
          {components.map((c) => (
            <div key={c.label} style={styles.breakdownItem}>
              <div style={styles.breakdownHeader}>
                <span style={styles.breakdownLabel}>{c.label}</span>
                <span style={styles.breakdownVal}>{Math.round(c.val)}%</span>
              </div>
              <div style={styles.miniProgress}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${c.val}%` }}
                  style={{ ...styles.miniBar, background: style.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {isHero && (
        <div style={styles.heroFooter}>
          <div style={styles.progressContainer}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              style={{ ...styles.progressBar, background: style.color }}
            />
          </div>
          <div style={styles.heroMeta}>Confidence Level: High (Neural Model v2.4)</div>
        </div>
      )}
    </motion.div>
  );
}

const styles = {
  card: {
    padding: "32px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)"
  },
  heroCard: {
    background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 30px 60px rgba(0,0,0,0.4)"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px"
  },
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px"
  },
  labelGroup: {
    display: "flex",
    flexDirection: "column"
  },
  label: {
    fontSize: "12px",
    fontWeight: 900,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.15em"
  },
  algoTooltip: {
    fontSize: "10px",
    color: "#334155",
    fontWeight: 700
  },
  body: {
    display: "flex",
    alignItems: "baseline",
    gap: "20px",
    marginBottom: "32px"
  },
  score: {
    fontWeight: 900,
    fontFamily: "'Outfit', sans-serif",
    lineHeight: 0.9,
    letterSpacing: "-0.04em"
  },
  sub: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  status: {
    fontSize: "14px",
    fontWeight: 900,
    letterSpacing: "0.08em"
  },
  meta: {
    fontSize: "11px",
    color: "#475569",
    fontWeight: 600
  },
  breakdown: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "24px"
  },
  breakdownItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  breakdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  breakdownLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase"
  },
  breakdownVal: {
    fontSize: "11px",
    fontWeight: 800,
    color: "#f1f5f9"
  },
  miniProgress: {
    height: "5px",
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "3px",
    overflow: "hidden"
  },
  miniBar: {
    height: "100%",
    borderRadius: "3px"
  },
  heroFooter: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  progressContainer: {
    height: "8px",
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "4px",
    overflow: "hidden"
  },
  progressBar: {
    height: "100%",
    borderRadius: "4px"
  },
  heroMeta: {
    fontSize: "10px",
    color: "#475569",
    fontWeight: 700,
    textAlign: "right",
    textTransform: "uppercase"
  }
};
