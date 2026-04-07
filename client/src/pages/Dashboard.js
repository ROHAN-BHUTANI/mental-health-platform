import React, {
  Suspense,
  lazy,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import InsightsCard from "../components/InsightsCard";
import HealthScoreCard from "../components/HealthScoreCard";
import StreakCard from "../components/StreakCard";
import DashboardSkeleton from "../components/DashboardSkeleton";
import MoodForm from "../components/MoodForm";

const ChatWindow = lazy(() => import("../components/ChatWindow"));
const AnalyticsCharts = lazy(() => import("../components/AnalyticsCharts"));

const navItems = [
  { label: "Overview", href: "#overview" },
  { label: "Analytics", href: "#analytics" },
  { label: "AI Insights", href: "#ai-insights" },
  { label: "Recent Activity", href: "#activity" },
  { label: "Support Chat", href: "#chat" }
];

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [premiumReady, setPremiumReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      await api.patch("/user/subscription", {
        plan: "premium",
        stripeCustomerId: `demo_${Date.now()}`
      });
      toast("Demo upgrade applied. Premium unlocked.", "success");
      setRefreshTick((current) => current + 1);
    } catch (requestError) {
      toast(requestError?.response?.data?.message || "Unable to upgrade right now", "error");
    } finally {
      setUpgrading(false);
    }
  };

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    const loadDashboard = async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError("");

      try {
        const [analyticsRes, subscriptionRes] = await Promise.all([
          api.get("/user/analytics"),
          api.get("/user/subscription")
        ]);

        let hasPremiumAccess = false;
        if ((subscriptionRes?.data?.subscription?.plan || "free") === "premium") {
          try {
            await api.get("/user/premium-check");
            hasPremiumAccess = true;
          } catch (_premiumError) {
            hasPremiumAccess = false;
          }
        }

        if (active) {
          setAnalytics(analyticsRes.data);
          setSubscription(subscriptionRes?.data?.subscription || null);
          setPremiumReady(hasPremiumAccess);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError?.response?.data?.message || requestError.message || "Unable to load dashboard");
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadDashboard(refreshTick !== 0);
    const timer = setInterval(() => {
      if (active) {
        setRefreshTick((current) => current + 1);
      }
    }, 60000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [token, refreshTick]);

  const overviewCards = useMemo(() => {
    if (!analytics) return [];

    const { lastMoodEntry } = analytics;
    return [
      {
        label: "Total Entries",
        value: analytics.totalEntries,
        meta: "Tracked days across the timeline"
      },
      {
        label: "Avg Mood",
        value: analytics.avgMood?.toFixed ? analytics.avgMood.toFixed(1) : analytics.avgMood,
        meta: `Correlation ${Number(analytics.summary?.sleepMoodCorrelation || 0).toFixed(2)}`
      },
      {
        label: "Avg Stress",
        value: analytics.avgStress?.toFixed ? analytics.avgStress.toFixed(1) : analytics.avgStress,
        meta: `Volatility ${Number(analytics.summary?.stressVolatility || 0).toFixed(1)}`
      },
      {
        label: "Avg Sleep",
        value: analytics.avgSleep?.toFixed ? analytics.avgSleep.toFixed(1) : analytics.avgSleep,
        meta: "Hours per day"
      },
      {
        label: "Last Entry",
        value: lastMoodEntry ? `${lastMoodEntry.mood}/10` : "-",
        meta: lastMoodEntry ? `${lastMoodEntry.stress}/10 stress · ${lastMoodEntry.sleep}h sleep` : "Waiting for data"
      },
      {
        label: "Risk Level",
        value: analytics.riskLevel || analytics.status || "Stable",
        meta: `Confidence ${(Number(analytics.confidence || 0) * 100).toFixed(0)}%`
      }
    ];
  }, [analytics]);

  const weekly = analytics?.summary?.weeklyInsights;
  const monthly = analytics?.summary?.monthlyInsights;

  const chartData = useMemo(() => {
    if (!analytics) {
      return {
        moodTrend: [],
        stressTrend: [],
        emotionDistribution: [],
        activityImpact: []
      };
    }

    return analytics.charts || {};
  }, [analytics]);

  if (loading && !analytics) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={styles.shell}>
      <motion.aside
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        style={styles.sidebar}
      >
        <div style={styles.brandBlock}>
          <div style={styles.brandMark}>MindAI</div>
          <div style={styles.brandCopy}>
            Enterprise mental health intelligence, adapted in real time.
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} style={styles.navItem}>
              {item.label}
            </a>
          ))}
        </nav>

        <div style={styles.sidebarCard}>
          <div style={styles.sidebarLabel}>Welcome back</div>
          <div style={styles.sidebarValue}>{user?.name || analytics?.user?.name || "User"}</div>
          <div style={styles.sidebarMeta}>Your dashboard is refreshing every 60 seconds.</div>
          <div style={styles.sidebarMeta}>Plan: {(subscription?.plan || user?.plan || "free").toUpperCase()}</div>
        </div>

        <div style={styles.sidebarCard}>
          <div style={styles.sidebarLabel}>Current streak</div>
          <div style={styles.sidebarValue}>{analytics?.streak_count || 0} days</div>
          <div style={styles.sidebarMeta}>Keep logging daily to extend the streak.</div>
        </div>
      </motion.aside>

      <main style={styles.main}>
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={styles.hero}
        >
          <div>
            <div style={styles.eyebrow}>AI Mental Health Analytics</div>
            <h1 style={styles.title}>Welcome back, {user?.name || analytics?.user?.name || "User"}</h1>
            <p style={styles.subtitle}>
              A real-time view of mood trends, stress prediction, sleep correlation, and the latest ML guidance.
            </p>
          </div>

          <div style={styles.heroActions}>
            <button
              type="button"
              onClick={() => setRefreshTick((current) => current + 1)}
              style={styles.refreshButton}
            >
              {refreshing ? "Refreshing..." : "Refresh data"}
            </button>
          </div>
        </motion.header>

        {error && (
          <div style={styles.errorBanner}>
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setRefreshTick((current) => current + 1)}
              style={styles.retryButton}
            >
              Retry
            </button>
          </div>
        )}

        <section id="overview" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Executive Overview</h2>
            <span style={styles.sectionMeta}>Updated from your latest health logs</span>
          </div>

          <div style={styles.kpiGrid}>
            {overviewCards.map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.28 }}
                style={styles.kpiCard}
              >
                <div style={styles.kpiLabel}>{card.label}</div>
                <div style={styles.kpiValue}>{card.value}</div>
                <div style={styles.kpiMeta}>{card.meta}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section style={styles.twoColumnSection}>
          <div style={styles.cardBlock}>
            <HealthScoreCard score={analytics?.score || 0} status={analytics?.status || "Stable"} />
          </div>
          <div style={styles.cardBlock}>
            <StreakCard streak={analytics?.streak_count || 0} />
          </div>
        </section>

        <section id="analytics" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Analytics Workspace</h2>
            <span style={styles.sectionMeta}>Mood, stress, sleep, and activity relationships</span>
          </div>
          <Suspense fallback={<div style={styles.chatFallback}>Loading analytics charts...</div>}>
            <AnalyticsCharts {...chartData} />
          </Suspense>
        </section>

        <section id="ai-insights" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>AI Insights Panel</h2>
            <span style={styles.sectionMeta}>Dynamic ML guidance and risk context</span>
          </div>

          <InsightsCard
            status={analytics?.status}
            insight={analytics?.insights || "No insights yet."}
            recommendations={analytics?.recommendations || []}
            aiSuggestion={analytics?.aiSuggestionOfDay}
            riskLevel={analytics?.riskLevel}
            emotionalStabilityScore={analytics?.emotionalStabilityScore}
            confidence={analytics?.confidence || 0}
          />

          {!premiumReady && (subscription?.plan || user?.plan || "free") !== "premium" && (
            <div style={styles.upgradeCard}>
              <div style={styles.upgradeTitle}>Premium ML insights locked</div>
              <div style={styles.upgradeText}>
                Upgrade your subscription to unlock premium risk forecasting checks and advanced AI assistance.
              </div>
              <button type="button" style={styles.upgradeButton} onClick={handleUpgrade} disabled={upgrading}>
                {upgrading ? "Upgrading..." : "Upgrade (Demo)"}
              </button>
            </div>
          )}

          <div style={styles.periodGrid}>
            <div style={styles.periodCard}>
              <div style={styles.periodTitle}>Weekly insight</div>
              <div style={styles.periodValue}>
                {weekly ? `${weekly.current.avgMood.toFixed(1)} mood / ${weekly.current.avgStress.toFixed(1)} stress` : "-"}
              </div>
              <div style={styles.periodMeta}>
                {weekly ? `Delta mood ${weekly.deltaMood >= 0 ? "+" : ""}${weekly.deltaMood} · sleep ${weekly.current.avgSleep.toFixed(1)}h` : "Waiting for more data"}
              </div>
            </div>

            <div style={styles.periodCard}>
              <div style={styles.periodTitle}>Monthly insight</div>
              <div style={styles.periodValue}>
                {monthly ? `${monthly.current.avgMood.toFixed(1)} mood / ${monthly.current.avgStress.toFixed(1)} stress` : "-"}
              </div>
              <div style={styles.periodMeta}>
                {monthly ? `Delta mood ${monthly.deltaMood >= 0 ? "+" : ""}${monthly.deltaMood} · sleep ${monthly.current.avgSleep.toFixed(1)}h` : "Waiting for more data"}
              </div>
            </div>
          </div>
        </section>

        <section id="activity" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Activity</h2>
            <span style={styles.sectionMeta}>Latest mood logs and daily context</span>
          </div>

          <div style={styles.activityGrid}>
            <div style={styles.activityList}>
              {(analytics?.recentEntries || []).map((entry) => (
                <div key={`${entry._id || entry.date}-${entry.date}`} style={styles.activityItem}>
                  <div>
                    <div style={styles.activityDate}>{new Date(entry.date).toLocaleDateString()}</div>
                    <div style={styles.activityText}>
                      Mood {entry.mood}/10, stress {entry.stress}/10, sleep {entry.sleep}h
                    </div>
                  </div>
                </div>
              ))}

              {!analytics?.recentEntries?.length && (
                <div style={styles.activityItem}>No recent entries yet.</div>
              )}
            </div>

            <div id="chat" style={styles.chatBlock}>
              <Suspense fallback={<div style={styles.chatFallback}>Loading AI support chat...</div>}>
                <ChatWindow />
              </Suspense>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Daily Log Entry</h2>
            <span style={styles.sectionMeta}>Add a new entry to refresh analytics and predictions</span>
          </div>
          <MoodForm onMoodAdded={() => setRefreshTick((current) => current + 1)} />
        </section>
      </main>
    </div>
  );
}

const styles = {
  shell: {
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    gap: 24,
    minHeight: "100vh",
    padding: 24,
    color: "#e2e8f0",
    background: "radial-gradient(circle at 12% 10%, rgba(14,165,233,0.08), transparent 42%), radial-gradient(circle at 92% 86%, rgba(16,185,129,0.06), transparent 45%), linear-gradient(180deg, #060b16, #0b1220 45%, #0b1324)"
  },
  sidebar: {
    position: "sticky",
    top: 24,
    alignSelf: "start",
    height: "calc(100vh - 48px)",
    padding: 24,
    borderRadius: 28,
    background: "linear-gradient(180deg, rgba(15,23,42,0.99), rgba(15,23,42,0.9))",
    border: "1px solid rgba(148,163,184,0.2)",
    boxShadow: "0 16px 28px rgba(2,6,23,0.28), 0 24px 70px rgba(2,6,23,0.42)",
    display: "flex",
    flexDirection: "column",
    gap: 18
  },
  brandBlock: {
    paddingBottom: 12,
    borderBottom: "1px solid rgba(148,163,184,0.1)"
  },
  brandMark: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "0.02em",
    marginBottom: 10,
    background: "linear-gradient(90deg, #22d3ee, #34d399)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  brandCopy: {
    color: "#94a3b8",
    lineHeight: 1.5,
    fontSize: 14
  },
  nav: {
    display: "grid",
    gap: 8
  },
  navItem: {
    display: "block",
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0",
    textDecoration: "none",
    border: "1px solid transparent"
  },
  sidebarCard: {
    padding: 16,
    borderRadius: 20,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(148,163,184,0.2)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
  },
  sidebarLabel: {
    fontSize: 12,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8
  },
  sidebarValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: 8
  },
  sidebarMeta: {
    color: "#dbe5f5",
    fontSize: 13,
    lineHeight: 1.5
  },
  main: {
    minWidth: 0,
    display: "grid",
    gap: 24
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    padding: 28,
    borderRadius: 30,
    background: "linear-gradient(135deg, rgba(14,165,233,0.16), rgba(15,23,42,0.92) 60%, rgba(16,185,129,0.12))",
    border: "1px solid rgba(148,163,184,0.22)",
    boxShadow: "0 18px 34px rgba(2,6,23,0.3), 0 28px 72px rgba(2,6,23,0.38)"
  },
  eyebrow: {
    color: "#67e8f9",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
    marginBottom: 10
  },
  title: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 46px)",
    lineHeight: 1.08,
    color: "#f8fafc"
  },
  subtitle: {
    marginTop: 12,
    maxWidth: 700,
    color: "#d6e1f0",
    lineHeight: 1.6
  },
  heroActions: {
    display: "flex",
    gap: 12,
    alignItems: "center"
  },
  refreshButton: {
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(59,130,246,0.18))",
    color: "#e2e8f0",
    cursor: "pointer",
    fontWeight: 700
  },
  errorBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fecaca"
  },
  retryButton: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(254,202,202,0.3)",
    background: "rgba(239,68,68,0.2)",
    color: "#fee2e2",
    cursor: "pointer",
    fontWeight: 700
  },
  section: {
    display: "grid",
    gap: 18
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "baseline"
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    color: "#f8fafc"
  },
  sectionMeta: {
    color: "#b7c5db",
    fontSize: 13
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16
  },
  kpiCard: {
    padding: 18,
    borderRadius: 22,
    background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,23,42,0.86))",
    border: "1px solid rgba(148,163,184,0.22)",
    borderLeft: "3px solid rgba(34,211,238,0.52)",
    boxShadow: "0 14px 28px rgba(2,6,23,0.26), 0 24px 56px rgba(2,6,23,0.34)",
    transition: "box-shadow 0.24s ease, transform 0.24s ease"
  },
  kpiLabel: {
    color: "#b9c7dc",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em"
  },
  kpiValue: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: 800,
    color: "#ffffff",
    textShadow: "0 2px 18px rgba(34,211,238,0.16)"
  },
  kpiMeta: {
    marginTop: 8,
    color: "#dbe5f5",
    fontSize: 13,
    lineHeight: 1.5
  },
  twoColumnSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18
  },
  cardBlock: {
    minWidth: 0
  },
  periodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
    marginTop: 16
  },
  periodCard: {
    padding: 18,
    borderRadius: 20,
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(148,163,184,0.2)",
    boxShadow: "0 12px 26px rgba(2,6,23,0.26)",
    transition: "transform 0.24s ease, box-shadow 0.24s ease"
  },
  periodTitle: {
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: 12,
    marginBottom: 10
  },
  periodValue: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: 700
  },
  periodMeta: {
    marginTop: 8,
    color: "#d7e1f0",
    lineHeight: 1.5
  },
  upgradeCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.28)"
  },
  upgradeTitle: {
    fontWeight: 700,
    color: "#fef3c7"
  },
  upgradeText: {
    marginTop: 6,
    color: "#fde68a",
    lineHeight: 1.5
  },
  upgradeButton: {
    marginTop: 12,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(251,191,36,0.35)",
    background: "linear-gradient(135deg, rgba(245,158,11,0.35), rgba(217,119,6,0.3))",
    color: "#fffbeb",
    cursor: "pointer",
    fontWeight: 700
  },
  activityGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
    gap: 18,
    alignItems: "stretch"
  },
  activityList: {
    display: "grid",
    gap: 12
  },
  activityItem: {
    padding: 16,
    borderRadius: 18,
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(148,163,184,0.2)",
    boxShadow: "0 10px 22px rgba(2,6,23,0.24)"
  },
  activityDate: {
    color: "#67e8f9",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6
  },
  activityText: {
    color: "#e2e8f0",
    lineHeight: 1.5
  },
  chatBlock: {
    minWidth: 0
  },
  chatFallback: {
    padding: 20,
    borderRadius: 20,
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "#d4e0f0"
  }
};