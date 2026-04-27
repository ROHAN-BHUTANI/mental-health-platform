import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mood as moodApi } from "../../api";
import VoiceInput from "../common/VoiceInput";

const MOOD_EMOJIS = ["😫", "😔", "😐", "😊", "🤩"];
const STRESS_ICONS = ["🌊", "🍃", "⚡", "🔥", "🌋"];

export default function MoodForm({ onMoodAdded }) {
  const [moodScore, setMoodScore] = useState(5);
  const [stressScore, setStressScore] = useState(5);
  const [sleepHours, setSleepHours] = useState(8);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getEmoji = (score) => MOOD_EMOJIS[Math.floor((score - 1) / 2.5)] || "😐";
  const getStressIcon = (score) => STRESS_ICONS[Math.floor((score - 1) / 2.5)] || "🍃";

  const submitMood = async () => {
    setLoading(true);
    try {
      await moodApi.logMood({
        moodScore: moodScore,
        stressScore: stressScore,
        sleepHours: sleepHours,
        text: note,
        date: new Date().toISOString().slice(0, 10)
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNote("");
        if (onMoodAdded) onMoodAdded();
      }, 2000);
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={styles.successState}
          >
            <div style={styles.successIcon}>✨</div>
            <h3 style={styles.successTitle}>Logged!</h3>
            <p style={styles.successText}>Your analytics are updating.</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.icon}>{getEmoji(moodScore)}</span>
                <label style={styles.label}>Mood Level</label>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                style={styles.range}
              />
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.icon}>{getStressIcon(stressScore)}</span>
                <label style={styles.label}>Stress Intensity</label>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={stressScore}
                onChange={(e) => setStressScore(Number(e.target.value))}
                style={styles.range}
              />
            </div>

            <div style={styles.noteBox}>
              <div style={styles.noteHeader}>
                <label style={styles.label}>Notes</label>
                <VoiceInput onResult={(text) => setNote(p => p ? `${p} ${text}` : text)} />
              </div>
              <textarea
                placeholder="What's on your mind?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={styles.textarea}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submitMood}
              disabled={loading}
              style={{
                ...styles.submit,
                background: loading ? "#1e293b" : "linear-gradient(135deg, #22d3ee, #8b5cf6)"
              }}
            >
              {loading ? (
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity }}>
                  Processing Pulse...
                </motion.span>
              ) : "Complete Daily Log"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  card: {
    padding: "24px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    minHeight: "400px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  section: {
    marginBottom: "32px"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
  },
  icon: {
    fontSize: "32px"
  },
  label: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.1em"
  },
  range: {
    width: "100%",
    height: "12px",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.1)",
    outline: "none",
    WebkitAppearance: "none",
    cursor: "pointer"
  },
  noteBox: {
    marginBottom: "32px"
  },
  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  },
  textarea: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "16px",
    color: "white",
    fontSize: "16px",
    minHeight: "100px",
    resize: "none"
  },
  submit: {
    width: "100%",
    padding: "18px",
    borderRadius: "20px",
    border: "none",
    color: "white",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(34,211,238,0.2)"
  },
  successState: {
    textAlign: "center"
  },
  successIcon: {
    fontSize: "64px",
    marginBottom: "16px"
  },
  successTitle: {
    fontSize: "24px",
    margin: 0
  },
  successText: {
    color: "#94a3b8"
  }
};
