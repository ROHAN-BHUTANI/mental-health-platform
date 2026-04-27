import React from "react";
import { motion } from "framer-motion";

const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.container}
    >
      <div style={styles.icon}>{icon || "📁"}</div>
      <h3 style={styles.title}>{title || "No data yet"}</h3>
      <p style={styles.subtitle}>{subtitle || "Start your journey by adding your first entry."}</p>
      {actionLabel && (
        <button onClick={onAction} style={styles.button}>
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    textAlign: "center",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.04)",
    width: "100%",
    minHeight: "260px"
  },
  icon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: 0.8
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    color: "#f1f5f9",
    fontFamily: "'Outfit', sans-serif"
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    maxWidth: "240px",
    lineHeight: 1.5
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    borderRadius: "12px",
    border: "1px solid rgba(34,211,238,0.3)",
    background: "rgba(34,211,238,0.1)",
    color: "#22d3ee",
    fontWeight: 700,
    cursor: "pointer"
  }
};

export default EmptyState;
