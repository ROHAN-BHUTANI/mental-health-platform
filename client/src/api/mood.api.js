import client from "./client";

/**
 * Mood API
 * --------
 * Logic for creating mood entries and fetching history.
 */

export const createMood = async (moodData) => {
  const { data } = await client.post("/mood", moodData);
  return data;
};

export const getMoods = async () => {
  const { data } = await client.get("/mood");
  return data;
};

export const logMood = async (logData) => {
  const { data } = await client.post("/mood/log", logData);
  return data;
};

export const getMoodHistory = async () => {
  const { data } = await client.get("/mood/history");
  return data;
};
