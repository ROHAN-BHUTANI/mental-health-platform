const MoodLog = require("../models/MoodLog");
const { ok, fail } = require("../utils/response");

// Simple AI proxy; replace with real model call (e.g., OpenAI, local ML)
exports.chat = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return fail(res, 401, "Unauthorized");

    const { message, history = [] } = req.body || {};
    if (!message || !message.trim()) {
      return fail(res, 400, "Message is required");
    }

    const recentLogs = await MoodLog.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    const averageStress = recentLogs.length
      ? recentLogs.reduce((sum, item) => sum + (Number(item.stress) || 0), 0) / recentLogs.length
      : 0;

    const averageMood = recentLogs.length
      ? recentLogs.reduce((sum, item) => sum + (Number(item.mood) || 0), 0) / recentLogs.length
      : 0;

    const urgentMessage = /self-harm|suicide|kill myself|end my life|hurt myself/i.test(message);
    let aiReply = "I hear you. Tell me what feels most difficult right now so I can help you break it down.";

    if (urgentMessage) {
      aiReply = "I’m really sorry you’re going through this. Please contact emergency services or a local crisis line right now, and reach out to someone you trust immediately. If you want, stay here and tell me your country so I can help find the right crisis support.";
    } else if (averageStress >= 7) {
      aiReply = "Your recent logs show elevated stress. Try a short reset: slow breathing for two minutes, then write down one thing you can defer until tomorrow.";
    } else if (averageMood >= 7) {
      aiReply = "Your recent trend looks steady. Keep reinforcing the routines that are working and avoid overloading your day.";
    } else if (averageMood > 0) {
      aiReply = "Your recent check-ins suggest some fluctuation. Focus on one stabilizer today: sleep, hydration, movement, or a brief pause away from screens.";
    }

    const safeHistory = Array.isArray(history) ? history : [];
    // history already contains the user message from client; only append assistant here
    const newHistory = [
      ...safeHistory,
      { role: "assistant", content: aiReply }
    ].slice(-20); // keep last 20 turns

    return ok(res, { reply: aiReply, history: newHistory });
  } catch (err) {
    console.error("chat error:", err);
    return fail(res, 500, err.message);
  }
};
