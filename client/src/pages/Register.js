import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const { name, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await register(formData);
      toast("Account created successfully", "success");
      navigate("/dashboard");
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Registration failed";
      setError(message);
      toast(message, "error");
    }
  };

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.card}
      >
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Start logging daily mood, stress, and sleep patterns.</p>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={name}
            onChange={onChange}
            style={styles.input}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={onChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={onChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        {error && <div style={styles.error}>{error}</div>}

        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#4f46e5" }}>
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)"
  },
  card: {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(15px)",
    padding: "40px",
    borderRadius: "20px",
    width: "350px",
    textAlign: "center",
    color: "white"
  },
  title: {
    marginBottom: "20px"
  },
  subtitle: {
    marginBottom: "18px",
    color: "rgba(255,255,255,0.82)"
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "none"
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },
  error: {
    marginTop: "14px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "rgba(239,68,68,0.18)",
    color: "#fecaca"
  }
};

export default Register;
