import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (token) => {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
};

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mh_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
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
          resolve(api.request(originalRequest));
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
      return api.request(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("mh_token");
      localStorage.removeItem("mh_refresh_token");
      localStorage.removeItem("mh_user");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
