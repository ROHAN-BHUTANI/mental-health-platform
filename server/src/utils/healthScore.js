/**
 * Compute a mental health score (0-100) from risk, stress, and sleep.
 * Inputs:
 *  - risk_score: 0-1 or 0-100
 *  - avg_stress: 1-10 scale
 *  - avg_sleep: hours (0-24, ideal around 7-9)
 * Output:
 *  { score: number, status: "Stable" | "Moderate" | "High Risk" }
 */

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

function normalizeRisk(risk) {
  const pct = risk <= 1 ? risk * 100 : risk;
  return clamp(pct, 0, 100);
}

function computeScore({ risk_score = 0, avg_stress = 5, avg_sleep = 7 }) {
  const riskPct = normalizeRisk(risk_score);
  const stressPct = clamp((avg_stress / 10) * 100, 0, 100);

  // Sleep penalty: optimal 7-9 hours; penalize deviation
  const sleepIdeal = 8;
  const sleepPenalty = clamp(Math.abs(avg_sleep - sleepIdeal) * 8, 0, 100); // max penalty 100

  // Weighted aggregate (weights sum to 1)
  const scoreRaw =
    1 -
    (0.5 * (riskPct / 100) +
      0.3 * (stressPct / 100) +
      0.2 * (sleepPenalty / 100));

  const score = clamp(Math.round(scoreRaw * 100), 0, 100);

  let status = "Stable";
  if (score < 40) status = "High Risk";
  else if (score < 70) status = "Moderate";

  return { score, status };
}

module.exports = { computeScore };
