// Rule-based recommendation engine for mental health insights
// Input: { risk_score, trend, avg_sleep, latest_stress }
// Output: { status, recommendations, insights }

const normalizeRisk = (risk) => {
  if (risk == null) return 0;
  // If risk looks like 0-1, convert to percentage
  const val = risk <= 1 ? risk * 100 : risk;
  return Math.max(0, Math.min(100, val));
};

const buildResponse = (status, recommendations, insights, riskPercent, trend) => ({
  status,
  recommendations,
  insights,
  risk_score: riskPercent,
  trend
});

function generateRecommendations({ risk_score, trend, avg_sleep, latest_stress }) {
  const riskPercent = normalizeRisk(risk_score);
  const safeTrend = trend || "stable";

  if (riskPercent > 70 && safeTrend === "increasing") {
    return buildResponse(
      "High Risk",
      [
        "Take a break today",
        "Avoid long work sessions",
        "Try breathing exercises"
      ],
      "Your stress levels are लगातार increasing",
      riskPercent,
      safeTrend
    );
  }

  if (riskPercent >= 40 && riskPercent <= 70) {
    return buildResponse(
      "Moderate",
      [
        "Maintain work-life balance",
        "Sleep at least 7 hours"
      ],
      "You are slightly stressed but manageable",
      riskPercent,
      safeTrend
    );
  }

  return buildResponse(
    "Stable",
    [
      "Keep maintaining your routine"
    ],
    "Your mental health is stable",
    riskPercent,
    safeTrend
  );
}

module.exports = {
  generateRecommendations
};
