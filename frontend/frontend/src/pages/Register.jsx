import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Activity,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginUser, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // Restricted strictly to Patient role for public self-registration
    const payload = {
      name: cleanName,
      full_name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: "Patient",
    };

    try {
      let response;

      // Endpoint strategy: Try multiple route variants to prevent 404 Not Found errors
      try {
        response = await API.post("/api/v1/auth/register", payload);
      } catch (err1) {
        if (err1.response && err1.response.status === 404) {
          try {
            response = await API.post("/auth/register", payload);
          } catch (err2) {
            if (err2.response && err2.response.status === 404) {
              const baseURL = API.defaults.baseURL || "https://medcore-hms.onrender.com";
              const cleanBase = baseURL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
              response = await axios.post(`${cleanBase}/api/v1/auth/register`, payload);
            } else {
              throw err2;
            }
          }
        } else {
          throw err1;
        }
      }

      const { access_token, user } = response.data;
      const userData = user || {
        email: cleanEmail,
        name: cleanName,
        role: "Patient",
      };

      // Handle context login flexible parameters
      const handleAuthLogin = loginUser || login;
      if (typeof handleAuthLogin === "function") {
        try {
          handleAuthLogin(userData, access_token);
        } catch {
          handleAuthLogin(access_token, userData);
        }
      }

      // Local storage fallback persistence
      localStorage.setItem("token", access_token);
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Invalid registration fields.");
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Registration failed. Email may already be registered.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        {/* Left Side Form Panel */}
        <div className="register-form-panel">
          <div className="register-form-header">
            <h1 className="register-form-title">Patient Registration</h1>
            <p className="register-form-subtitle">
              Register a patient account to book appointments and access health portal tools
            </p>
          </div>

          {error && (
            <div className="register-error-alert">
              <AlertCircle size={18} color="#991b1b" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoCapitalize="none" autoCorrect="off">
            <div className="register-input-group">
              <label className="register-input-label">Full Name</label>
              <div className="register-input-wrapper">
                <User size={18} color="#94a3b8" className="register-input-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="register-field-input"
                />
              </div>
            </div>

            <div className="register-input-group">
              <label className="register-input-label">Email Address</label>
              <div className="register-input-wrapper">
                <Mail size={18} color="#94a3b8" className="register-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="register-field-input"
                />
              </div>
            </div>

            <div className="register-input-group">
              <label className="register-input-label">Password</label>
              <div className="register-input-wrapper" style={{ position: "relative" }}>
                <Lock size={18} color="#94a3b8" className="register-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="register-field-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#94a3b8" />
                  ) : (
                    <Eye size={18} color="#94a3b8" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="register-submit-btn">
              {loading ? (
                "Creating Patient Account..."
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Patient Account</span>
                </>
              )}
            </button>
          </form>

          <div className="register-login-footer">
            <span>Already have an account? </span>
            <Link to="/login" className="register-login-link">
              Sign in here
            </Link>
          </div>
        </div>

        {/* Right Side Branding Panel */}
        <div className="register-brand-panel">
          <div className="register-brand-header">
            <div className="register-logo-badge">
              <Activity size={28} color="#38bdf8" />
            </div>
            <div>
              <h2 className="register-brand-title">MedCore HMS</h2>
              <p className="register-brand-subtitle">Patient Health Portal</p>
            </div>
          </div>

          <div className="register-feature-list">
            <div className="register-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Self-Service Patient Registration</span>
            </div>
            <div className="register-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Online Appointment Scheduling</span>
            </div>
            <div className="register-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Access Digital Prescriptions & Lab Results</span>
            </div>
            <div className="register-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Secure Encrypted Health Records</span>
            </div>
          </div>

          <div className="register-security-footer">
            <ShieldCheck size={16} color="#94a3b8" />
            <span>256-Bit Encrypted Patient Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}