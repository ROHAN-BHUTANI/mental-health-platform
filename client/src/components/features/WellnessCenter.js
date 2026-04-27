import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BreathingExercise from "./BreathingExercise";
import client from "../../api/client";

const WellnessCenter = () => {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([
    { id: 1, label: "Log Morning Reflection", done: false },
    { id: 2, label: "5-Min Guided Breathing", done: false },
    { id: 3, label: "Review Neural Trends", done: false }
  ]);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const res = await client.get("/wellness/tip");
        setTip(res.data);
      } catch (err) {
        console.error("Tip error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTip();
  }, []);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <section style={styles.grid}>
      <div style={styles.planSection}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>Today's Protocol</div>
          <div style={styles.sectionSubtitle}>{tasks.filter(t => t.done).length}/{tasks.length} Completed</div>
        </div>
        
        <div style={styles.taskList}>
          {tasks.map((task) => (
            <motion.div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              style={{
                ...styles.taskItem,
                background: task.done ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.03)",
                borderColor: task.done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)"
              }}
            >
              <div style={{
                ...styles.checkbox,
                background: task.done ? "#10b981" : "transparent",
                borderColor: task.done ? "#10b981" : "#475569"
              }}>
                {task.done && "✓"}
              </div>
              <span style={{
                ...styles.taskLabel,
                textDecoration: task.done ? "line-through" : "none",
                color: task.done ? "#64748b" : "#e2e8f0"
              }}>
                {task.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        whileHover={{ y: -4 }}
        style={styles.tipCard}
      >
        <div style={styles.badge}>Strategic Suggestion</div>
        <div style={styles.content}>
          <div style={styles.tipIcon}>⚡</div>
          <div style={styles.tipBody}>
            {loading ? (
              <div style={styles.skeleton} />
            ) : (
              <p style={styles.text}>{tip?.text || "Synchronizing biological baseline for optimal performance..."}</p>
            )}
            <div style={styles.category}>Focus Area: {tip?.category || "Cognitive Load"}</div>
          </div>
        </div>
      </motion.div>

      <BreathingExercise />
    </section>
  );
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "24px"
  },
  planSection: {
    padding: "24px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.05)"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "20px"
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#f8fafc",
    fontFamily: "'Outfit', sans-serif"
  },
  sectionSubtitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase"
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    borderRadius: "16px",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  checkbox: {
    width: "18px",
    height: "18px",
    borderRadius: "6px",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "white",
    fontWeight: 800
  },
  taskLabel: {
    fontSize: "14px",
    fontWeight: 500
  },
  tipCard: {
    padding: "32px 24px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.08)",
    position: "relative",
    overflow: "hidden"
  },
  badge: {
    position: "absolute",
    top: "16px",
    right: "24px",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#a78bfa",
    background: "rgba(167,139,250,0.1)",
    padding: "4px 10px",
    borderRadius: "99px"
  },
  content: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start"
  },
  tipIcon: {
    fontSize: "32px",
    padding: "12px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "20px"
  },
  tipBody: {
    flex: 1
  },
  text: {
    fontSize: "18px",
    lineHeight: 1.5,
    color: "#f1f5f9",
    margin: "0 0 12px 0",
    fontWeight: 600,
    fontFamily: "'Outfit', sans-serif"
  },
  category: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  skeleton: {
    height: "24px",
    width: "80%",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "4px"
  }
};

export default WellnessCenter;
