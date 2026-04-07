import React, { memo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend
} from "recharts";
import { motion } from "framer-motion";

const chartCard = {
  background: "linear-gradient(180deg, rgba(15,23,42,0.94), rgba(15,23,42,0.82))",
  border: "1px solid rgba(148,163,184,0.12)",
  borderRadius: "24px",
  padding: "20px",
  boxShadow: "0 18px 50px rgba(2,6,23,0.28)"
};

const palette = ["#34d399", "#60a5fa", "#f59e0b", "#f87171", "#a78bfa", "#22d3ee"];

function EmptyState({ title, subtitle }) {
  return (
    <div style={{ ...chartCard, minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 8 }}>
      <h3 style={{ margin: 0, color: "#e2e8f0" }}>{title}</h3>
      <p style={{ margin: 0, color: "#94a3b8", maxWidth: 280 }}>{subtitle}</p>
    </div>
  );
}

function AnalyticsCharts({ moodTrend = [], stressTrend = [], emotionDistribution = [], activityImpact = [] }) {
  const hasMoodData = moodTrend.length > 0;
  const hasStressData = stressTrend.length > 0;

  return (
    <div style={styles.grid}>
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={chartCard}>
        <h3 style={styles.heading}>Mood Trends Over Time</h3>
        <p style={styles.subheading}>Area chart of mood, stress, and sleep trajectories across logged days.</p>
        {hasMoodData ? (
          <div style={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodTrend} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.42} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 14 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Area type="monotone" dataKey="mood" stroke="#34d399" fill="url(#moodFill)" strokeWidth={3} />
                <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sleep" stroke="#60a5fa" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No trend data yet" subtitle="Add a mood entry to unlock the time-series chart." />
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={chartCard}>
        <h3 style={styles.heading}>Stress Prediction Trend</h3>
        <p style={styles.subheading}>Flask ML predictions and stress values over time.</p>
        {hasStressData ? (
          <div style={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stressTrend} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 14 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No prediction trend yet" subtitle="Stress predictions will appear after the first log." />
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={chartCard}>
        <h3 style={styles.heading}>Emotion Distribution</h3>
        <p style={styles.subheading}>A clear view of how current logs cluster emotionally.</p>
        {emotionDistribution.length ? (
          <div style={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={emotionDistribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={92} paddingAngle={4}>
                  {emotionDistribution.map((entry, index) => (
                    <Cell key={`emotion-${entry.name}`} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 14 }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No emotion data" subtitle="Your emotion distribution will be inferred from the log stream." />
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={chartCard}>
        <h3 style={styles.heading}>Activity Impact</h3>
        <p style={styles.subheading}>Signals derived from sleep, stress, and mood combinations.</p>
        {activityImpact.length ? (
          <div style={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityImpact} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 14 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {activityImpact.map((entry, index) => (
                    <Cell key={`impact-${entry.name}`} fill={palette[(index + 2) % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No activity impact data" subtitle="This view populates as daily logs accumulate." />
        )}
      </motion.section>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px"
  },
  heading: {
    margin: 0,
    color: "#e2e8f0",
    fontSize: "18px"
  },
  subheading: {
    margin: "6px 0 14px",
    color: "#94a3b8",
    fontSize: "13px"
  },
  chartWrap: {
    width: "100%",
    height: 300
  }
};

export default memo(AnalyticsCharts);