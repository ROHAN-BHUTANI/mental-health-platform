import client from "./client";

/**
 * Auth API
 * --------
 * Logic for registration, login, profile, and logout.
 */

export const login = async (email, password) => {
  const { data } = await client.post("/auth/login", { email, password });
  return data;
};

export const register = async (name, email, password) => {
  const { data } = await client.post("/auth/register", { name, email, password });
  return data;
};

export const getProfile = async () => {
  const { data } = await client.get("/auth/profile");
  return data;
};

export const logout = async (refreshToken) => {
  const { data } = await client.post("/auth/logout", { refreshToken });
  return data;
};
