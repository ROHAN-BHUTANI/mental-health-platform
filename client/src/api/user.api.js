import client from "./client";

/**
 * User & Insights API
 * -------------------
 * Logic for analytics, insights, profile updates, and subscriptions.
 */

export const getAnalytics = async () => {
  const { data } = await client.get("/user/analytics");
  return data;
};

export const getInsights = async () => {
  const { data } = await client.get("/user/insights");
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await client.patch("/user/profile", profileData);
  return data;
};

export const getSubscription = async () => {
  const { data } = await client.get("/user/subscription");
  return data;
};

export const updateSubscription = async (subData) => {
  const { data } = await client.patch("/user/subscription", subData);
  return data;
};
