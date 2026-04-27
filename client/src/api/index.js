import client from "./client";
import * as auth from "./auth.api";
import * as mood from "./mood.api";
import * as user from "./user.api";
import * as chat from "./chat.api";

const api = {
  client,
  auth,
  mood,
  user,
  chat
};

export default api;
export { auth, mood, user, chat };
