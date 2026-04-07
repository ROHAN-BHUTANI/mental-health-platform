import React from "react";

export default function DashboardSkeleton() {
  return (
    <div style={styles.shell}>
      <div style={styles.sidebar}>
        <div style={styles.lineLarge} />
        <div style={styles.line} />
        <div style={styles.line} />
        <div style={styles.line} />
      </div>
      <div style={styles.content}>
        <div style={styles.hero} />
        <div style={styles.kpiGrid}>
          <div style={styles.card} />
          <div style={styles.card} />
          <div style={styles.card} />
          <div style={styles.card} />
        </div>
        <div style={styles.chartGrid}>
          <div style={styles.chart} />
          <div style={styles.chart} />
          <div style={styles.chart} />
          <div style={styles.chart} />
        </div>
      </div>
    </div>
  );
}

const pulse = {
  background: "linear-gradient(90deg, rgba(30,41,59,0.7), rgba(51,65,85,0.7), rgba(30,41,59,0.7))",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.8s ease-in-out infinite"
};

const styles = {
  shell: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: 20,
    minHeight: "80vh"
  },
  sidebar: {
    ...pulse,
    borderRadius: 24,
    padding: 24
  },
  content: {
    display: "grid",
    gap: 20
  },
  hero: {
    ...pulse,
    height: 120,
    borderRadius: 24
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16
  },
  card: {
    ...pulse,
    height: 110,
    borderRadius: 20
  },
  chart: {
    ...pulse,
    minHeight: 320,
    borderRadius: 24
  },
  lineLarge: {
    ...pulse,
    height: 38,
    borderRadius: 999,
    marginBottom: 24
  },
  line: {
    ...pulse,
    height: 18,
    borderRadius: 999,
    marginBottom: 14
  }
};