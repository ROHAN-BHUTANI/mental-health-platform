const axios = require("axios");
const axiosRetryImport = require("axios-retry");
const axiosRetry = axiosRetryImport.default || axiosRetryImport;

const mlClient = axios.create({
  baseURL: process.env.ML_SERVICE_URL || "http://localhost:5001",
  timeout: 8000
});

axiosRetry(mlClient, {
  retries: Number(process.env.ML_RETRIES || 2),
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    const status = error?.response?.status;
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || status >= 500;
  }
});

mlClient.fallbackAnalyzePayload = {
  sentimentLabel: null,
  sentimentScore: 0,
  depressionProbability: 0,
  confidence: 0,
  volatility: 0,
  trendSlope: 0,
  anomalyDetected: false,
  predictedFutureRisk: 0,
  burnout: {
    risk_score: 0,
    trend: "stable",
    alert_message: "ML service unavailable, using fallback insights."
  },
  stressTrend: {
    trend: "stable"
  }
};

mlClient.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const message = error?.response?.data || error.message;
    if (process.env.NODE_ENV === "development") {
      console.error("ML service error:", message);
    }
    return Promise.reject(error);
  }
);

module.exports = mlClient;
