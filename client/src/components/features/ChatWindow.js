import React, { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { chat as chatApi } from "../../api";
import VoiceInput from "../common/VoiceInput";

export default function ChatWindow() {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI support assistant. How are you feeling today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [lastFailedPayload, setLastFailedPayload] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (preset) => {
    const trimmed = preset?.message || input.trim();
    if (!trimmed || !token) return;

    const userMsg = { role: "user", content: trimmed };
    const baseMessages = preset?.baseMessages || messages;
    const nextHistory = [...baseMessages, userMsg];
    setMessages(nextHistory);
    if (!preset) {
      setInput("");
    }
    setLoading(true);
    setRequestError("");
    setLastFailedPayload(null);
    try {
      const data = await chatApi.sendMessage(userMsg.content, nextHistory);
      const { reply } = data;
      if (reply) {
        setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      }
    } catch (err) {
      setRequestError(err?.response?.data?.message || err.message || "Unable to send message");
      setLastFailedPayload({
        message: userMsg.content,
        baseMessages
      });
      if (!preset) {
        setMessages(baseMessages);
        setInput(userMsg.content);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceResult = (text) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>AI Chat Support</div>
      <div style={styles.messages}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              ...(msg.role === "user" ? styles.userBubble : styles.botBubble)
            }}
          >
            {msg.content.split('\n').map((line, i) => {
              const isHeader = /^\d+\.\s+\*\*(.*)\*\*$/.test(line.trim());
              const isBoldOnly = /^\*\*(.*)\*\*$/.test(line.trim());
              
              let content = line;
              if (isHeader) content = line.trim();
              else if (isBoldOnly) content = line.trim().slice(2, -2);

              return (
                <div key={i} style={{ 
                  marginBottom: line.trim() === '' ? '12px' : '4px',
                  fontWeight: (isHeader || isBoldOnly) ? 800 : 400,
                  fontSize: (isHeader || isBoldOnly) ? '15px' : '14px',
                  color: (isHeader || isBoldOnly) ? '#22d3ee' : '#e2e8f0',
                  borderBottom: isHeader ? '1px solid rgba(34,211,238,0.2)' : 'none',
                  paddingBottom: isHeader ? '4px' : '0',
                  marginTop: isHeader ? '12px' : '0'
                }}>
                  {content}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={styles.inputBar}>
        <VoiceInput onResult={handleVoiceResult} disabled={loading} />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or speak..."
          style={styles.textarea}
        />
        <button
          style={styles.sendBtn}
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
      {requestError && (
        <div style={styles.errorRow}>
          <span style={styles.errorText}>{requestError}</span>
          {lastFailedPayload && (
            <button
              type="button"
              style={styles.retryBtn}
              onClick={() => sendMessage(lastFailedPayload)}
              disabled={loading}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(145deg, #0b1220, #0f172a)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    height: "480px",
    overflow: "hidden",
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)"
  },
  header: {
    padding: "14px 18px",
    fontWeight: 700,
    color: "#e2e8f0",
    borderBottom: "1px solid rgba(255,255,255,0.08)"
  },
  messages: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  message: {
    maxWidth: "75%",
    padding: "12px 14px",
    borderRadius: "14px",
    lineHeight: 1.5,
    fontSize: "14px",
    color: "#e2e8f0",
    whiteSpace: "pre-wrap"
  },
  userBubble: {
    marginLeft: "auto",
    background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
    color: "#0b1220"
  },
  botBubble: {
    marginRight: "auto",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.08)"
  },
  inputBar: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    padding: "12px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(15,23,42,0.9)",
    backdropFilter: "blur(6px)"
  },
  textarea: {
    flex: 1,
    minHeight: "44px",
    maxHeight: "120px",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
    resize: "vertical"
  },
  sendBtn: {
    padding: "0 18px",
    height: "44px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
    color: "#0b1220",
    fontWeight: 700,
    cursor: "pointer",
    minWidth: "70px"
  },
  errorRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderTop: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.1)"
  },
  errorText: {
    color: "#fecaca",
    fontSize: "12px"
  },
  retryBtn: {
    border: "1px solid rgba(254,202,202,0.4)",
    background: "rgba(239,68,68,0.18)",
    color: "#fee2e2",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 700
  }
};
