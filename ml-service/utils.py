import numpy as np
from sklearn.linear_model import LinearRegression

def compute_time_series_metrics(scores):
    scores = np.array(scores)

    if len(scores) < 2:
        return {
            "volatility": 0,
            "trendSlope": 0,
            "anomalyDetected": False
        }

    mean = np.mean(scores)
    std = np.std(scores)

    z_scores = (scores - mean) / std if std != 0 else np.zeros(len(scores))
    anomalies = np.abs(z_scores) > 2

    volatility = float(np.std(scores))
    trend = float(np.polyfit(range(len(scores)), scores, 1)[0])

    return {
        "volatility": volatility,
        "trendSlope": trend,
        "anomalyDetected": bool(np.any(anomalies))
    }


def predict_future_risk(risk_scores):
    if len(risk_scores) < 2:
        return 0

    X = np.arange(len(risk_scores)).reshape(-1,1)
    y = np.array(risk_scores)

    model = LinearRegression()
    model.fit(X,y)

    next_day = np.array([[len(risk_scores)]])
    prediction = model.predict(next_day)[0]

    return float(prediction)


# ---------------------------
# Stress trend + burnout risk
# ---------------------------

def _last_n(values, n=7):
    if not isinstance(values, (list, tuple, np.ndarray)):
        return []
    return list(values)[-n:]


def compute_stress_trend(stress_values):
    recent = np.array(_last_n(stress_values, 7), dtype=float)
    if recent.size == 0:
        return {"slope": 0.0, "trend": "stable", "volatility": 0.0}

    idx = np.arange(len(recent)).reshape(-1, 1)
    model = LinearRegression()
    model.fit(idx, recent)
    slope = float(model.coef_[0])

    volatility = float(np.std(recent))

    if slope > 0.05:
        trend = "increasing"
    elif slope < -0.05:
        trend = "decreasing"
    else:
        trend = "stable"

    return {"slope": slope, "trend": trend, "volatility": volatility, "recent": recent.tolist()}


def predict_burnout_risk(stress_values):
    """
    Heuristic risk estimator using:
    - Latest stress level (scaled 0-1)
    - Trend slope (normalized)
    - Volatility (normalized)
    Returns 0-1 risk_score.
    """
    recent = np.array(_last_n(stress_values, 7), dtype=float)
    if recent.size == 0:
        return 0.1  # minimal risk when no data

    latest = recent[-1]
    latest_score = np.clip(latest / 10.0, 0, 1)

    trend_info = compute_stress_trend(recent)
    slope = trend_info["slope"]
    # Assume slope of +1 per day is very high; normalize around that
    slope_norm = np.clip((slope + 1) / 2, 0, 1)

    volatility_norm = np.clip(trend_info["volatility"] / 3.0, 0, 1)

    # weighted sum
    risk = 0.5 * latest_score + 0.3 * slope_norm + 0.2 * volatility_norm
    return float(np.clip(risk, 0, 1))
