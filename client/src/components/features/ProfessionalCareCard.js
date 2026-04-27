import React from "react";
import { motion } from "framer-motion";

const ProfessionalCareCard = ({ riskLevel, avgStress }) => {
  // Trigger condition: High Risk or Stress > 7
  const isHighRisk = riskLevel === "High";
  const isElevatedStress = Number(avgStress) >= 7;

  if (!isHighRisk && !isElevatedStress) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.card}
    >
      <div style={styles.header}>
        <div style={styles.iconBox}>⚕️</div>
        <div>
          <h3 style={styles.title}>Professional Support</h3>
          <p style={styles.subtitle}>Compassionate guidance for your well-being</p>
        </div>
      </div>

      <div style={styles.body}>
        <p style={styles.message}>
          Our system has noticed some persistent stress patterns. While our AI is here to support your daily habits, 
          speaking with a professional can provide the specialized care you deserve.
        </p>

        <div style={styles.helplineSection}>
          <div style={styles.sectionLabel}>Trusted Support Lines (India)</div>
          <div style={styles.helplineGrid}>
            <a href="tel:08046110007" style={styles.helpline}>
              <span style={styles.hpName}>NIMHANS Helpline</span>
              <span style={styles.hpNum}>080-46110007</span>
            </a>
            <a href="tel:919999666555" style={styles.helpline}>
              <span style={styles.hpName}>Vandrevala Foundation</span>
              <span style={styles.hpNum}>9999 666 555</span>
            </a>
          </div>
        </div>

        <div style={styles.actionRow}>
          <a 
            href="https://www.google.com/maps/search/psychiatrist+near+me" 
            target="_blank" 
            rel="noopener noreferrer"
            style={styles.primaryBtn}
          >
            📍 Find Nearby Professional
          </a>
          <a 
            href="https://www.practo.com/search/doctors?results_type=doctor&q=[{%22word%22:%22psychiatrist%22,%22autofill%22:true}]" 
            target="_blank" 
            rel="noopener noreferrer"
            style={styles.secondaryBtn}
          >
            Consult on Practo
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const styles = {
  card: {
    padding: "24px",
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))",
    borderRadius: "24px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    marginBottom: "24px"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px"
  },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background: "rgba(59, 130, 246, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#3b82f6"
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
    color: "#f8fafc",
    fontFamily: "'Outfit', sans-serif"
  },
  subtitle: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 500
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  message: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#cbd5e1",
    margin: 0
  },
  helplineSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  helplineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px"
  },
  helpline: {
    display: "flex",
    flexDirection: "column",
    padding: "12px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.05)",
    textDecoration: "none",
    transition: "background 0.2s"
  },
  hpName: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#f1f5f9"
  },
  hpNum: {
    fontSize: "12px",
    color: "#3b82f6",
    fontWeight: 600,
    marginTop: "2px"
  },
  actionRow: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "8px"
  },
  primaryBtn: {
    padding: "14px",
    background: "#3b82f6",
    color: "white",
    textAlign: "center",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "14px",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)"
  },
  secondaryBtn: {
    padding: "14px",
    background: "rgba(255,255,255,0.05)",
    color: "#f1f5f9",
    textAlign: "center",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "14px",
    border: "1px solid rgba(255,255,255,0.1)"
  }
};

export default ProfessionalCareCard;
