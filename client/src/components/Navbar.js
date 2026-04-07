import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Navbar = () => {
  const { token, logout, user } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast("You have been signed out", "info");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div>
        <h3 style={styles.logo}>MindAI</h3>
        <div style={styles.subtitle}>{user?.name || "Personal analytics workspace"}</div>
      </div>

      {token && (
        <div style={styles.actions}>
          <div style={styles.planPill}>{(user?.plan || "free").toUpperCase()}</div>
          <Link to="/dashboard" style={styles.link}>
            Dashboard
          </Link>
          <button onClick={handleLogout} style={styles.button}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 28px",
    background: "rgba(15,23,42,0.92)",
    color: "white",
    alignItems: "center",
    borderBottom: "1px solid rgba(148,163,184,0.12)",
    backdropFilter: "blur(14px)",
    position: "sticky",
    top: 0,
    zIndex: 20
  },
  logo: {
    margin: 0,
    fontSize: 18,
    letterSpacing: "0.02em"
  },
  subtitle: {
    marginTop: 4,
    color: "#94a3b8",
    fontSize: 12
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  planPill: {
    fontSize: 11,
    letterSpacing: "0.08em",
    padding: "8px 10px",
    borderRadius: 999,
    background: "rgba(52,211,153,0.16)",
    color: "#6ee7b7",
    border: "1px solid rgba(52,211,153,0.35)"
  },
  link: {
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)"
  },
  button: {
    background: "linear-gradient(135deg, #ef4444, #f97316)",
    border: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer"
  }
};

export default Navbar;
