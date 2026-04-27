import React from "react";

export default function DashboardSkeleton() {
  return (
    <div style={styles.shell}>
      <div style={styles.header}>
        <div className="shimmer" style={styles.logo} />
        <div className="shimmer" style={styles.circle} />
      </div>
      
      <main style={styles.main}>
        <div className="shimmer" style={styles.hero} />
        
        <div style={styles.kpiGrid}>
          <div className="shimmer" style={styles.card} />
          <div className="shimmer" style={styles.card} />
        </div>

        <div className="shimmer" style={styles.bigCard} />
        <div className="shimmer" style={styles.bigCard} />
      </main>

      <div style={styles.nav}>
        <div className="shimmer" style={styles.navItem} />
        <div className="shimmer" style={styles.navItem} />
        <div className="shimmer" style={styles.navItem} />
        <div className="shimmer" style={styles.navItem} />
      </div>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#060b16",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.08)"
  },
  logo: {
    height: 24,
    width: 100,
    borderRadius: 8
  },
  circle: {
    height: 32,
    width: 32,
    borderRadius: "50%"
  },
  main: {
    padding: "20px 16px",
    display: "grid",
    gap: "32px"
  },
  hero: {
    height: 180,
    borderRadius: 32
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  card: {
    height: 100,
    borderRadius: 20
  },
  bigCard: {
    height: 300,
    borderRadius: 32
  },
  nav: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    padding: "12px 24px 24px",
    display: "flex",
    justifyContent: "space-around",
    background: "rgba(15,23,42,0.95)",
    borderTop: "1px solid rgba(255,255,255,0.08)"
  },
  navItem: {
    height: 40,
    width: 40,
    borderRadius: 12
  }
};