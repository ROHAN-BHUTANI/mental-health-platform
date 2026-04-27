import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const SmartNudge = ({ user, lastLogDate }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getNudge = () => {
    const today = new Date().toISOString().slice(0, 10);
    const lastLog = lastLogDate ? new Date(lastLogDate).toISOString().slice(0, 10) : null;

    if (!lastLog) return "Ready to calibrate your first neural baseline? It only takes 30 seconds.";
    if (lastLog === today) return "Baseline synchronized. Your current metrics are being processed for tomorrow's trends.";
    
    return "The system is missing today's diagnostic data. Log your pulse to maintain model accuracy.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.container}
    >
      <div style={styles.icon}>🔔</div>
      <div style={styles.content}>
        <div style={styles.greeting}>{getGreeting()}, {user?.name?.split(" ")[0]}</div>
        <div style={styles.message}>{getNudge()}</div>
      </div>
    </motion.div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 20px",
    background: "rgba(34, 211, 238, 0.05)",
    borderRadius: "20px",
    border: "1px solid rgba(34, 211, 238, 0.1)",
    marginBottom: "8px"
  },
  icon: {
    fontSize: "20px",
    background: "rgba(34, 211, 238, 0.1)",
    padding: "8px",
    borderRadius: "12px"
  },
  content: {
    display: "flex",
    flexDirection: "column"
  },
  greeting: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#22d3ee",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  message: {
    fontSize: "14px",
    color: "#cbd5e1",
    lineHeight: 1.4,
    marginTop: "2px"
  }
};

export default SmartNudge;
