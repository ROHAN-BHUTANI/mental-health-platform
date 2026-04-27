import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const SafetyHub = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={styles.overlay}
        >
          <motion.div
            initial={{ y: 50, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 50, scale: 0.9 }}
            style={styles.modal}
          >
            <header style={styles.header}>
              <div style={styles.warningIcon}>⚠️</div>
              <h2 style={styles.title}>Safety Support Hub</h2>
              <button onClick={onClose} style={styles.closeBtn}>✕</button>
            </header>

            <div style={styles.body}>
              <p style={styles.intro}>
                We've detected some high-stress patterns. Your safety is our priority. 
                Please reach out to these professional resources or try a grounding exercise.
              </p>

              <section style={styles.resourceSection}>
                <h3 style={styles.subTitle}>Professional Help (India)</h3>
                <div style={styles.resourceGrid}>
                  <a href="tel:08046110007" style={styles.resourceCard}>
                    <div style={styles.resIcon}>📞</div>
                    <div>
                      <div style={styles.resName}>NIMHANS Helpline</div>
                      <div style={styles.resDetail}>Call 080-46110007 (24/7)</div>
                    </div>
                  </a>
                  <a href="tel:919999666555" style={styles.resourceCard}>
                    <div style={styles.resIcon}>☎️</div>
                    <div>
                      <div style={styles.resName}>Vandrevala Foundation</div>
                      <div style={styles.resDetail}>Call 9999 666 555 (24/7)</div>
                    </div>
                  </a>
                </div>
              </section>

              <section style={styles.exerciseSection}>
                <h3 style={styles.subTitle}>Immediate Relief</h3>
                <div style={styles.exerciseCard}>
                  <div style={styles.exIcon}>🧘</div>
                  <div>
                    <div style={styles.exName}>The 5-4-3-2-1 Rule</div>
                    <div style={styles.exDetail}>
                      Look around: 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <footer style={styles.footer}>
              <button onClick={onClose} style={styles.dismissBtn}>I'm feeling okay now</button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(6, 11, 22, 0.9)",
    backdropFilter: "blur(8px)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  modal: {
    width: "100%",
    maxWidth: "480px",
    background: "#0f172a",
    borderRadius: "32px",
    border: "2px solid #ef4444",
    boxShadow: "0 0 40px rgba(239, 68, 68, 0.2)",
    overflow: "hidden"
  },
  header: {
    padding: "24px",
    background: "rgba(239, 68, 68, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    borderBottom: "1px solid rgba(239, 68, 68, 0.2)"
  },
  warningIcon: {
    fontSize: "24px"
  },
  title: {
    margin: 0,
    fontSize: "20px",
    color: "#f8fafc",
    fontFamily: "'Outfit', sans-serif",
    flex: 1
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "20px",
    cursor: "pointer"
  },
  body: {
    padding: "24px"
  },
  intro: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: "0 0 24px 0"
  },
  subTitle: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 12px 0"
  },
  resourceSection: {
    marginBottom: "24px"
  },
  resourceGrid: {
    display: "grid",
    gap: "12px"
  },
  resourceCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    textDecoration: "none",
    color: "#f1f5f9",
    transition: "transform 0.2s"
  },
  resIcon: {
    fontSize: "24px"
  },
  resName: {
    fontSize: "15px",
    fontWeight: 700
  },
  resDetail: {
    fontSize: "12px",
    color: "#64748b"
  },
  exerciseSection: {
    marginBottom: "8px"
  },
  exerciseCard: {
    display: "flex",
    gap: "16px",
    padding: "16px",
    background: "rgba(34,211,238,0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(34,211,238,0.1)"
  },
  exIcon: {
    fontSize: "24px"
  },
  exName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#22d3ee"
  },
  exDetail: {
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: 1.4,
    marginTop: "4px"
  },
  footer: {
    padding: "16px 24px 24px",
    textAlign: "center"
  },
  dismissBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "13px",
    textDecoration: "underline",
    cursor: "pointer"
  }
};

export default SafetyHub;
