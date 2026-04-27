import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext({
  toast: () => {}
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((message, variant = "info", duration = 3200) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, message, variant }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, [dismissToast]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={styles.viewport}>
        {toasts.map((item) => (
          <div key={item.id} style={{ ...styles.toast, ...variantStyles[item.variant] }}>
            <span>{item.message}</span>
            <button type="button" onClick={() => dismissToast(item.id)} style={styles.closeButton}>
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = {
  viewport: {
    position: "fixed",
    top: 16,
    right: 16,
    zIndex: 9999,
    display: "grid",
    gap: 10,
    width: "min(380px, calc(100vw - 24px))"
  },
  toast: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 12,
    padding: "10px 12px",
    color: "#f8fafc",
    border: "1px solid rgba(148,163,184,0.25)",
    boxShadow: "0 10px 25px rgba(2, 6, 23, 0.35)"
  },
  closeButton: {
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12
  }
};

const variantStyles = {
  info: {
    background: "linear-gradient(135deg, rgba(14,116,144,0.95), rgba(15,23,42,0.95))"
  },
  success: {
    background: "linear-gradient(135deg, rgba(21,128,61,0.95), rgba(15,23,42,0.95))"
  },
  warning: {
    background: "linear-gradient(135deg, rgba(180,83,9,0.95), rgba(15,23,42,0.95))"
  },
  error: {
    background: "linear-gradient(135deg, rgba(185,28,28,0.95), rgba(15,23,42,0.95))"
  }
};