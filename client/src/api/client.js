import axios from "axios";

/**
 * Base Axios Client
 * -----------------
 * Handles:
 * 1. Base URL & Timeout
 * 2. JWT Injection via Request Interceptor
 * 3. Automatic Token Refresh via Response Interceptor
 */

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (token) => {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
};

const client = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("mh_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error?.response?.status;

    if (status !== 401 || originalRequest.__retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("mh_refresh_token");
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingQueue.push((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(client.request(originalRequest));
        });
      });
    }

    isRefreshing = true;
    originalRequest.__retry = true;

    try {
      const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
      const nextToken = refreshResponse?.data?.token || refreshResponse?.data?.accessToken;
      const nextRefreshToken = refreshResponse?.data?.refreshToken;

      if (!nextToken) {
        throw new Error("Missing access token in refresh response");
      }

      localStorage.setItem("mh_token", nextToken);
      if (nextRefreshToken) {
        localStorage.setItem("mh_refresh_token", nextRefreshToken);
      }
      processQueue(nextToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${nextToken}`;
      return client.request(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("mh_token");
      localStorage.removeItem("mh_refresh_token");
      localStorage.removeItem("mh_user");
      // Trigger logout or redirect if needed
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
