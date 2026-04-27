import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { AuthContext } from "./context/AuthContext";

// 🛡️ Error Boundary for Fail-Safe UI
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("UI Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", textAlign: "center", background: "#060b16", color: "#f8fafc", minHeight: "100vh" }}>
          <h2 style={{ color: "#ef4444" }}>Something went wrong.</h2>
          <p style={{ color: "#94a3b8" }}>The interface encountered an unexpected error.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: "12px 24px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "20px" }}
          >
            Reload Interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 🔒 Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { token } = useContext(AuthContext);

  return (
    <>
      {token && <Navbar />}

      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Home />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" /> : <Register />}
        />
      </Routes>
    </>
  );
}


function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppRoutes />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
