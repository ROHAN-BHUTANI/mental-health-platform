import React from "react";
import { motion } from "framer-motion";

export default function StreakCard({ streak = 0 }) {
  const color = streak >= 7 ? "#f97316" : "#22d3ee";
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={styles.card}
    >
      <div style={styles.content}>
        <div style={styles.visual}>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={styles.flame}
          >
            🔥
          </motion.div>
          <div style={styles.track}>
            {[...Array(7)].map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  ...styles.dot, 
                  background: i < (streak % 7 || (streak > 0 ? 7 : 0)) ? color : "rgba(255,255,255,0.05)" 
                }} 
              />
            ))}
          </div>
        </div>
        
        <div style={styles.stats}>
          <div style={styles.label}>Activity Streak</div>
          <div style={{ ...styles.value, color }}>
            {streak}
            <span style={styles.unit}>DAYS</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const styles = {
  card: {
    padding: "24px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 15px 30px rgba(0,0,0,0.25)"
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: "24px"
  },
  visual: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px"
  },
  flame: {
    fontSize: "40px",
    filter: "drop-shadow(0 0 10px rgba(249,115,22,0.4))"
  },
  track: {
    display: "flex",
    gap: "4px"
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%"
  },
  stats: {
    display: "flex",
    flexDirection: "column"
  },
  label: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.1em"
  },
  value: {
    fontSize: "48px",
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    lineHeight: 1,
    display: "flex",
    alignItems: "baseline",
    gap: "4px"
  },
  unit: {
    fontSize: "14px",
    color: "#475569"
  }
};
