import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VoiceInput = ({ onResult, onStart, onEnd, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        if (onStart) onStart();
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => {
        setIsListening(false);
        if (onEnd) onEnd();
      };

      setRecognition(rec);
    }
  }, [onResult, onStart, onEnd]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error("Mic error:", err);
      }
    }
  }, [recognition, isListening]);

  return (
    <div style={styles.container}>
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || !recognition}
        style={{
          ...styles.micButton,
          borderColor: isListening ? "#ef4444" : "rgba(255,255,255,0.1)",
          opacity: recognition ? 1 : 0.4,
          cursor: recognition ? "pointer" : "not-allowed"
        }}
        title={!recognition ? "Voice input not supported in this browser" : ""}
      >
        <AnimatePresence mode="wait">
          {!recognition ? (
            <span style={{ fontSize: "14px" }}>🚫</span>
          ) : isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.waveContainer}
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [8, 24, 8],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15
                  }}
                  style={styles.waveBar}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center"
  },
  micButton: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    border: "1px solid",
    background: "rgba(255,255,255,0.05)",
    color: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  waveContainer: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    height: "24px"
  },
  waveBar: {
    width: "3px",
    background: "#ef4444",
    borderRadius: "2px"
  }
};

export default VoiceInput;
