import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BreathingExercise = () => {
  const [phase, setPhase] = useState("inhale"); // inhale, hold, exhale
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let timer;
    if (isActive) {
      timer = setInterval(() => {
        setSeconds((prev) => (prev + 1) % 12);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  useEffect(() => {
    if (seconds < 4) {
      setPhase("inhale");
    } else if (seconds < 8) {
      setPhase("hold");
    } else {
      setPhase("exhale");
    }
  }, [seconds]);

  const circleVariants = {
    inhale: {
      scale: 1.5,
      backgroundColor: "rgba(34,211,238,0.4)",
      transition: { duration: 4, ease: "easeInOut" }
    },
    hold: {
      scale: 1.5,
      backgroundColor: "rgba(59,130,246,0.4)",
      transition: { duration: 4 }
    },
    exhale: {
      scale: 1,
      backgroundColor: "rgba(16,185,129,0.4)",
      transition: { duration: 4, ease: "easeInOut" }
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Guided Breathing</h3>
        <button
          onClick={() => setIsActive(!isActive)}
          style={isActive ? styles.stopButton : styles.startButton}
        >
          {isActive ? "Stop" : "Start"}
        </button>
      </div>

      <div style={styles.display}>
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={styles.phaseLabel}
          >
            {isActive ? phase.toUpperCase() : "READY?"}
          </motion.div>
        </AnimatePresence>

        <div style={styles.circleContainer}>
          <motion.div
            animate={isActive ? phase : "inhale"}
            variants={circleVariants}
            style={styles.circle}
          >
            <div style={styles.innerCircle} />
          </motion.div>
        </div>
        
        <p style={styles.hint}>
          {isActive 
            ? "Follow the circle to regulate your stress response."
            : "Click start for a 4-4-4 breathing session."}
        </p>
      </div>
    </div>
  );
};

const styles = {
  card: {
    padding: "24px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7))",
    border: "1px solid rgba(148,163,184,0.15)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
    textAlign: "center"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  title: {
    margin: 0,
    fontSize: "18px",
    color: "#f8fafc"
  },
  startButton: {
    padding: "8px 16px",
    borderRadius: "12px",
    background: "rgba(34,211,238,0.2)",
    color: "#22d3ee",
    border: "1px solid rgba(34,211,238,0.4)",
    cursor: "pointer",
    fontWeight: 600
  },
  stopButton: {
    padding: "8px 16px",
    borderRadius: "12px",
    background: "rgba(239,68,68,0.2)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.4)",
    cursor: "pointer",
    fontWeight: 600
  },
  display: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px"
  },
  phaseLabel: {
    fontSize: "24px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    color: "#fff",
    minHeight: "36px"
  },
  circleContainer: {
    width: "180px",
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  circle: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid rgba(255,255,255,0.2)"
  },
  innerCircle: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 0 20px rgba(255,255,255,0.6)"
  },
  hint: {
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.5,
    maxWidth: "240px"
  }
};

export default BreathingExercise;
