import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import client from "../../api/client";
import EmptyState from "../common/EmptyState";

const CommunityInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await client.get("/wellness/community-insights");
        setData(res.data);
      } catch (err) {
        console.error("Insights error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <div className="shimmer" style={styles.skeleton} />;

  if (data?.message?.includes("Insufficient")) {
    return (
      <div style={styles.card}>
        <EmptyState 
          icon="🛡️"
          title="Privacy Shield Active"
          subtitle={data.message}
        />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={styles.card}
    >
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <h3 style={styles.title}>Global Pulse</h3>
          <p style={styles.subtitle}>Anonymized community data</p>
        </div>
        <div style={styles.sampleSize}>
          <span style={styles.dot} /> {data?.sampleSize || 0} Participating
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <div style={styles.statEmoji}>☀️</div>
          <div style={styles.statVal}>{data?.averageMood || "0.0"}</div>
          <div style={styles.statLab}>Mood</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statEmoji}>🌪️</div>
          <div style={styles.statVal}>{data?.averageStress || "0.0"}</div>
          <div style={styles.statLab}>Stress</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statEmoji}>💤</div>
          <div style={styles.statVal}>{data?.averageSleep || "0.0"}h</div>
          <div style={styles.statLab}>Sleep</div>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.trend}>
          Trend: <span style={{ color: "#10b981" }}>{data?.trend || "Stable"}</span>
        </div>
      </div>
    </motion.div>
  );
};

const styles = {
  card: {
    padding: "24px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 15px 30px rgba(0,0,0,0.2)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px"
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column"
  },
  title: {
    margin: 0,
    fontSize: "20px",
    color: "#f8fafc",
    fontFamily: "'Outfit', sans-serif"
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: "#64748b"
  },
  sampleSize: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#94a3b8",
    background: "rgba(255,255,255,0.05)",
    padding: "4px 10px",
    borderRadius: "99px"
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#22d3ee",
    boxShadow: "0 0 8px #22d3ee"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "20px"
  },
  statBox: {
    padding: "16px 8px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "20px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.04)"
  },
  statEmoji: {
    fontSize: "20px",
    marginBottom: "8px"
  },
  statVal: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#fff"
  },
  statLab: {
    fontSize: "10px",
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: 700,
    letterSpacing: "0.05em"
  },
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "16px"
  },
  trend: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: 600
  },
  skeleton: {
    height: "220px",
    width: "100%",
    borderRadius: "32px",
    background: "rgba(255,255,255,0.03)"
  }
};

export default CommunityInsights;
