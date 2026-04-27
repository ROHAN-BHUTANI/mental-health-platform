import React, {
  Suspense,
  lazy,
  useContext
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { useDashboard } from "../hooks/useDashboard";

// Sub-components (Feature-specific)
import InsightsCard from "../components/features/InsightsCard";
import HealthScoreCard from "../components/features/HealthScoreCard";
import DashboardSkeleton from "../components/features/DashboardSkeleton";
import MoodForm from "../components/features/MoodForm";
import CommunityInsights from "../components/features/CommunityInsights";
import WellnessCenter from "../components/features/WellnessCenter";
import SafetyHub from "../components/features/SafetyHub";
import SmartNudge from "../components/features/SmartNudge";
import ProfessionalCareCard from "../components/features/ProfessionalCareCard";

// Lazy-loaded components for performance
const AnalyticsCharts = lazy(() => import("../components/features/AnalyticsCharts"));
const ChatWindow = lazy(() => import("../components/features/ChatWindow"));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Dashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const { analytics, loading, refreshing, triggerRefresh } = useDashboard(token);

  if (loading) return <DashboardSkeleton />;

  const charts = analytics?.charts || {};

  return (
    <div style={styles.shell}>
      <header style={styles.mobileHeader}>
        <div style={styles.brandMark}>MindCare AI</div>
        <div style={styles.headerRight}>
          <button onClick={triggerRefresh} style={styles.refreshIcon}>
            {refreshing ? "🔄" : "✨"}
          </button>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Safety Hub (Global Alert) */}
      <SafetyHub riskLevel={analytics?.riskLevel} />

      <div style={styles.fabContainer}>
        <motion.a 
          href="#log"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={styles.fab}
        >
          ➕
        </motion.a>
      </div>

      <AnimatePresence>
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={styles.main}
        >
          
          {/* PHASE 2.1 — HERO SECTION */}
          <section id="hero" style={styles.heroSection}>
            <SmartNudge user={user} lastLogDate={analytics?.lastMoodEntry?.date} />
            <motion.div variants={itemVariants} className="hero-layout" style={styles.heroLayout}>
              <div style={styles.heroText}>
                <h1 style={styles.title}>Hello, {user?.name?.split(' ')[0] || 'User'}</h1>
                <p style={styles.summaryLine}>
                  {analytics?.insights ? `${analytics.insights.slice(0, 80)}...` : "Initializing diagnostic engine..."}
                </p>
              </div>
              <div style={styles.heroScoreWrapper}>
                <HealthScoreCard 
                  score={analytics?.score || 0} 
                  status={analytics?.status || "Stable"} 
                  isHero={true}
                />
              </div>
            </motion.div>
          </section>

          {/* PHASE 2.7 — SAFETY / DOCTOR PANEL (Conditional) */}
          <ProfessionalCareCard 
            riskLevel={analytics?.riskLevel} 
            avgStress={analytics?.avgStress} 
          />

          {/* PHASE 2.2 — AI INSIGHTS PANEL (The "Why" & "What") */}
          <section id="ai-insights" style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Intelligence Report</h2>
            </div>
            <motion.div variants={itemVariants}>
              <InsightsCard
                status={analytics?.status}
                insight={analytics?.insights}
                recommendations={analytics?.recommendations}
                aiSuggestion={analytics?.aiSuggestionOfDay}
                riskLevel={analytics?.riskLevel}
                emotionalStabilityScore={analytics?.emotionalStabilityScore}
                confidence={analytics?.confidence}
                summary={analytics?.summary}
              />
            </motion.div>
          </section>

          {/* PHASE 2.3 — TODAY’S PLAN */}
          <section id="wellness" style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Daily Protocol</h2>
            </div>
            <motion.div variants={itemVariants}>
              <WellnessCenter />
            </motion.div>
          </section>

          {/* PHASE 2.5 — ANALYTICS (Existing Charts) */}
          <section id="analytics" style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Performance Metrics</h2>
            </div>
            <motion.div variants={itemVariants}>
              <Suspense fallback={<div style={styles.loadingBox}>Analyzing trends...</div>}>
                <AnalyticsCharts {...charts} />
              </Suspense>
            </motion.div>
          </section>

          {/* PHASE 2.6 — DISCOVERY SECTION */}
          <section id="research" style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Social Baseline & Discovery</h2>
            </div>
            <div className="dual-grid" style={styles.dualGrid}>
              <motion.div variants={itemVariants}>
                <CommunityInsights />
              </motion.div>
              <motion.div variants={itemVariants} style={styles.discoveryCard}>
                <div style={styles.discoveryIcon}>💡</div>
                <h3 style={styles.discoveryTitle}>Did you know?</h3>
                <p style={styles.discoveryText}>
                  Consistency in logging mood for just 7 days increases self-awareness scores by 40%. 
                  Your current streak is helping calibrate your baseline.
                </p>
              </motion.div>
            </div>
          </section>

          {/* SUPPORT & CHAT */}
          <section id="support" style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Assistant Chat</h2>
            </div>
            <motion.div variants={itemVariants} style={styles.chatWrapper}>
              <Suspense fallback={<div style={styles.loadingBox}>Connecting...</div>}>
                <ChatWindow />
              </Suspense>
            </motion.div>
          </section>

          {/* DATA INPUT */}
          <section id="log" style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Update Diagnostic Data</h2>
            </div>
            <motion.div variants={itemVariants}>
              <MoodForm onMoodAdded={triggerRefresh} />
            </motion.div>
          </section>

        </motion.main>
      </AnimatePresence>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#060b16",
    color: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif"
  },
  mobileHeader: {
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(15,23,42,0.85)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid rgba(255,255,255,0.08)"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  brandMark: {
    fontSize: "22px",
    fontWeight: 900,
    background: "linear-gradient(90deg, #22d3ee, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: "-0.02em"
  },
  refreshIcon: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    padding: "8px"
  },
  logoutBtn: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#94a3b8",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer"
  },
  main: {
    padding: "24px 20px 140px",
    maxWidth: "1100px",
    margin: "0 auto",
    width: "100%",
    display: "grid",
    gap: "64px"
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  heroLayout: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "32px",
    alignItems: "center"
  },
  heroText: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  title: {
    fontSize: "42px",
    margin: 0,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 800,
    letterSpacing: "-0.03em"
  },
  summaryLine: {
    fontSize: "15px",
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: 0
  },
  heroScoreWrapper: {
    width: "100%",
    maxWidth: "400px",
    justifySelf: "center"
  },
  section: {
    display: "grid",
    gap: "24px"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    paddingLeft: "4px",
    borderLeft: "4px solid #3b82f6"
  },
  sectionTitle: {
    fontSize: "16px",
    margin: 0,
    fontWeight: 900,
    color: "#f8fafc",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    paddingLeft: "12px"
  },
  dualGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "24px"
  },
  discoveryCard: {
    padding: "32px",
    background: "rgba(34,211,238,0.05)",
    borderRadius: "32px",
    border: "1px solid rgba(34,211,238,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  discoveryIcon: { fontSize: "32px" },
  discoveryTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#22d3ee",
    margin: 0,
    fontFamily: "'Outfit', sans-serif"
  },
  discoveryText: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: 0
  },
  fabContainer: {
    position: "fixed",
    bottom: "40px",
    right: "24px",
    zIndex: 1000
  },
  fab: {
    width: "64px",
    height: "64px",
    borderRadius: "32px",
    background: "linear-gradient(135deg, #22d3ee, #818cf8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    textDecoration: "none",
    boxShadow: "0 12px 32px rgba(34,211,238,0.4)",
    border: "2px solid rgba(255,255,255,0.1)"
  },
  chatWrapper: {
    height: "550px"
  },
  loadingBox: {
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "24px",
    color: "#475569",
    fontSize: "14px"
  }
};