import client from "./client";

/**
 * Chat API
 * --------
 * Logic for AI-assisted chat.
 */

export const sendMessage = async (message, history = []) => {
  const { data } = await client.post("/chat", { message, history });
  return data;
};
