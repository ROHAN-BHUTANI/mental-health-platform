import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function MoodForm({ onMoodAdded }) {
  const { authFetch } = useContext(AuthContext);
  const [moodScore, setMoodScore] = useState(5);
  const [stressScore, setStressScore] = useState(5);
  const [sleepHours, setSleepHours] = useState(8);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitMood = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        mood: moodScore,
        stress: stressScore,
        sleep: sleepHours,
        date
      };
      await authFetch("/mood/log", {
        method: "POST",
        data: payload
      });

      setMoodScore(5);
      setStressScore(5);
      setSleepHours(8);
      setDate(new Date().toISOString().slice(0, 10));
      if (typeof onMoodAdded === "function") {
        onMoodAdded();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to save mood entry");
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Daily Mood Log</h2>

      <label style={styles.label}>Mood (1-10)</label>
      <input
        type="range"
        min="1"
        max="10"
        value={moodScore}
        onChange={(e) => setMoodScore(Number(e.target.value))}
        style={styles.slider}
      />
      <div style={styles.value}>{moodScore}</div>

      <label style={styles.label}>Stress (1-10)</label>
      <input
        type="range"
        min="1"
        max="10"
        value={stressScore}
        onChange={(e) => setStressScore(Number(e.target.value))}
        style={styles.slider}
      />
      <div style={styles.value}>{stressScore}</div>

      <label style={styles.label}>Sleep (hours)</label>
      <input
        type="number"
        min="0"
        max="24"
        value={sleepHours}
        onChange={(e) => setSleepHours(Number(e.target.value))}
        style={styles.numberInput}
      />

      <label style={styles.label}>Date</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={styles.numberInput}
      />

      <button className="button" onClick={submitMood}>
        {loading ? "Analyzing..." : "Submit Mood"}
      </button>

      {error && (
        <p style={styles.error}>{error}</p>
      )}
    </div>
  );
}

const styles = {
  label: {
    display: "block",
    marginTop: 10,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "600"
  },
  slider: {
    width: "100%",
    accentColor: "#8b5cf6"
  },
  value: {
    textAlign: "right",
    fontSize: 12,
    color: "#cbd5e1",
    marginBottom: 6
  },
  numberInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    marginBottom: "12px"
  },
  error: {
    marginTop: 12,
    color: "#fca5a5"
  }
};
