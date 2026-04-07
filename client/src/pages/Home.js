import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <h1>AI-Powered Emotional Intelligence Platform</h1>
      <p>
        Monitor emotional patterns, detect burnout signals, and visualize
        sentiment trends using transformer-based NLP models.
      </p>

      <button onClick={() => navigate("/login")}>
        Launch Dashboard
      </button>
    </div>
  );
}
