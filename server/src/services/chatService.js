'use strict';

/**
 * @module chatService
 * @description Advanced Conversational AI service using Groq API (Llama 3).
 * Features structured therapeutic responses, context memory, and 
 * data-driven insights from user mood history.
 */

const MoodLog = require('../models/MoodLog');
const axios = require('axios');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile"; // Latest high-intelligence model

/** Maximum conversation turns retained in history for context window. */
const MAX_HISTORY_TURNS = 10; 

// ---------------------------------------------------------------------------
// Prompt Engineering (PHASE 2 — STRONG SYSTEM PROMPT)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `
You are an advanced AI mental health assistant.

Your goal is to provide deeply personalized, emotionally intelligent, and practical guidance.

You MUST:

1. Refer to user's situation specifically (not generic)
2. Connect patterns (sleep, stress, mood, behavior)
3. Explain WHY the user feels this way
4. Give ONLY 2–3 HIGH IMPACT recommendations (not long lists)
5. Provide a SHORT, clear daily plan
6. Use natural, human tone (not robotic or textbook)

---

## RESPONSE FORMAT:

1. **Understanding**: Acknowledge feelings in a human, natural way
2. **Insight**: Explain WHY based on patterns (overthinking, sleep, stress)
3. **Recommendations**: Highly practical, focused steps (max 3)
4. **Daily Plan**: Short routine (not long paragraphs)
5. **Encouragement**: Warm, real, not cliché

---

## STYLE RULES:

- Avoid generic phrases
- Avoid overly long paragraphs
- Make it feel like a real conversation
- Prioritize clarity over length

---

## CONTEXTUAL CONNECTIONS (HIGH VALUE):

If user mentions:
- sleep → connect to mood
- stress → connect to focus
- overthinking → connect to anxiety patterns

STRICT SAFETY RULE:
If the user mentions self-harm, suicide, or crisis, immediately prioritize safety and provide emergency resources first.
`;

// ---------------------------------------------------------------------------
// Exported service methods
// ---------------------------------------------------------------------------

/**
 * Processes a chat message using the Groq LLM API with automatic retry and structured fallback.
 */
async function processChat(userId, message, history = []) {
  if (!message || !String(message).trim()) {
    const err = new Error('Message is required');
    err.statusCode = 400;
    throw err;
  }

  // 1. Fetch User Context (Recent 7-day logs) for Perceived Intelligence
  const recentLogs = await MoodLog.find({ userId })
    .sort({ date: -1 })
    .limit(7)
    .lean();

  const avgMood = recentLogs.length 
    ? (recentLogs.reduce((s, l) => s + (l.mood || 0), 0) / recentLogs.length).toFixed(1)
    : "Unknown";
  
  const avgStress = recentLogs.length 
    ? (recentLogs.reduce((s, l) => s + (l.stress || 0), 0) / recentLogs.length).toFixed(1)
    : "Unknown";

  const contextSnippet = `
[User Data Baseline]:
- Recent Avg Mood: ${avgMood}/10
- Recent Avg Stress: ${avgStress}/10
- Context: The user has logged ${recentLogs.length} entries in the last 7 days.
`;

  // 2. Prepare Messages for LLM
  const messages = [
    { role: "system", content: SYSTEM_PROMPT + contextSnippet },
    ...history.slice(-MAX_HISTORY_TURNS).map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    })),
    { role: "user", content: message }
  ];

  // 3. Call Groq API with Retry Logic (PHASE 1 & 4)
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY_MISSING");
      }

      console.log(`[ChatService] LLM Attempt ${attempts + 1}/${maxAttempts} for user ${userId}`);

      const response = await axios.post(GROQ_URL, {
        model: MODEL,
        messages: messages,
        temperature: 0.6, // Slightly lower for more consistent structure
        max_tokens: 1200, // Ensure enough room for detailed response
        top_p: 1,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 12000 // 12s timeout
      });

      const reply = response.data.choices[0].message.content;
      console.log(`[ChatService] LLM success on attempt ${attempts + 1}`);

      // Update History
      const updatedHistory = [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: reply }
      ].slice(-MAX_HISTORY_TURNS);

      return { reply, history: updatedHistory };

    } catch (error) {
      attempts++;
      const errorDetail = error.response?.data || error.message;
      console.warn(`[ChatService] Attempt ${attempts} failed:`, errorDetail);

      if (attempts < maxAttempts) {
        console.log("[ChatService] Retrying LLM call...");
        // Small delay before retry
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      // If all attempts fail, trigger intelligent fallback
      console.error("[ChatService] All LLM attempts failed. Triggering recovery fallback.");
      const fallbackReply = _generateFallbackReply(message, Number(avgStress), Number(avgMood));
      
      return {
        reply: fallbackReply,
        history: [...history, { role: 'user', content: message }, { role: 'assistant', content: fallbackReply }].slice(-MAX_HISTORY_TURNS)
      };
    }
  }
}

/**
 * Improved Fallback Logic (PHASE 4)
 * Provides a structured, empathetic response even when the LLM is unavailable.
 */
function _generateFallbackReply(message, avgStress, avgMood) {
  const isCrisis = /self-harm|suicide|hurt myself|end my life/i.test(message);

  if (isCrisis) {
    return `1. **Understanding**: I've read your message and I want you to know that you are heard, and your pain is valid.
    
2. **Insight**: When we feel this level of distress, it can feel like there's no way out, but these feelings are often temporary and treatable.

3. **Recommendations**: 
   - Call or text 988 (in the US/Canada) or your local emergency number immediately.
   - Reach out to a trusted friend or family member right now.
   - Stay in a safe, public space if possible.

4. **Daily Plan**: Please stop everything else and connect with professional support immediately.

5. **Encouragement**: You don't have to carry this alone. There are people who want to support you through this exact moment. Please reach out.`;
  }

  return `*Note: AI Assistant is in stability mode (Service busy).*

1. **Understanding**: I hear that you're looking for support with "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}". It's brave to reach out when things feel heavy.

2. **Insight**: Based on your recent baseline (Stress: ${avgStress || 'elevated'}), your mind might be in a state of high alert. This can make problems feel more insurmountable than they actually are.

3. **Recommendations**: 
   - Practice "Box Breathing": Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat 3 times.
   - Write down the single most pressing thought in a journal to clear cognitive space.
   - Drink a glass of cold water to ground your physical senses.

4. **Daily Plan**: For the next hour, commit to one "low-stakes" task that doesn't require digital screens.

5. **Encouragement**: Even with our temporary technical limitations, your wellbeing remains the priority. You've handled tough days before, and you can navigate this one too.`;
}

module.exports = { processChat };
