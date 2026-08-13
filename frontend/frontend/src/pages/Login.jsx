import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Activity,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  UserCheck,
  Eye,
  EyeOff,
  HelpCircle,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginUser, login } = useAuth();
  const navigate = useNavigate();

  // Helper for email input placeholder depending on role
  const getEmailPlaceholder = () => {
    switch (role) {
      case "Doctor":
        return "doctor@medcore.com";
      case "Patient":
        return "patient@example.com";
      case "Staff":
        return "nurse@medcore.com";
      default:
        return "admin@medcore.com";
    }
  };

  // Explicit form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submitting empty fields
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();
    const payload = {
      email: cleanEmail,
      password: cleanPassword,
      role: role,
    };

    try {
      let response;

      // Endpoint strategy: Try multiple route variants to prevent 404 Not Found errors
      try {
        response = await API.post("/api/v1/auth/login", payload);
      } catch (err1) {
        if (err1.response && err1.response.status === 404) {
          try {
            response = await API.post("/auth/login", payload);
          } catch (err2) {
            if (err2.response && err2.response.status === 404) {
              // Direct fallback using origin backend URL
              const baseURL = API.defaults.baseURL || "https://medcore-hms.onrender.com";
              const cleanBase = baseURL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
              response = await axios.post(`${cleanBase}/api/v1/auth/login`, payload);
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
        name: cleanEmail.split("@")[0],
        role: role,
      };

      // Execute login via context with fallback parameter order
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
      console.error("Login attempt failed:", err);
      const serverMsg = err.response?.data?.detail;
      setError(
        typeof serverMsg === "string"
          ? serverMsg
          : "Invalid email or password. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Left Side Form Panel */}
        <div className="login-form-panel">
          <div className="login-form-header">
            <h1 className="login-form-title">Sign In</h1>
            <p className="login-form-subtitle">
              Select your role and enter your credentials to access your portal account
            </p>
          </div>

          {error && (
            <div className="login-error-alert">
              <AlertCircle size={18} color="#991b1b" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoCapitalize="none" autoCorrect="off">
            {/* Role Selection Dropdown */}
            <div className="login-input-group">
              <label className="login-input-label">Select Role</label>
              <div className="login-input-wrapper">
                <UserCheck size={18} color="#94a3b8" className="login-input-icon" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="login-select-input"
                >
                  <option value="Admin">Administrator</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Patient">Patient</option>
                  <option value="Staff">Medical Staff / Nurse</option>
                </select>
              </div>
            </div>

            {/* Email Address */}
            <div className="login-input-group">
              <label className="login-input-label">Email Address</label>
              <div className="login-input-wrapper">
                <Mail size={18} color="#94a3b8" className="login-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={getEmailPlaceholder()}
                  required
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="login-field-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-input-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="login-input-label">Password</label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "12px",
                    color: "#38bdf8",
                    textDecoration: "none",
                    marginBottom: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <HelpCircle size={12} />
                  <span>Forgot Password?</span>
                </Link>
              </div>
              <div className="login-input-wrapper" style={{ position: "relative" }}>
                <Lock size={18} color="#94a3b8" className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="login-field-input"
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

            {/* Manual Action Button */}
            <button type="submit" disabled={loading} className="login-submit-btn">
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  <span>Sign In as {role}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-register-footer">
            <span>Don't have an account? </span>
            <Link to="/register" className="login-register-link">
              Create an account
            </Link>
          </div>
        </div>

        {/* Right Side Decorative Panel */}
        <div className="login-brand-panel">
          <div className="login-brand-header">
            <div className="login-logo-badge">
              <Activity size={28} color="#38bdf8" />
            </div>
            <div>
              <h2 className="login-brand-title">MedCore HMS</h2>
              <p className="login-brand-subtitle">Healthcare Operations Suite</p>
            </div>
          </div>

          <div className="login-feature-list">
            <div className="login-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Real-time Patient Records & Medical Charts</span>
            </div>
            <div className="login-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Doctor Scheduling & Appointment Booking</span>
            </div>
            <div className="login-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Integrated Billing, PDF Invoices & Analytics</span>
            </div>
            <div className="login-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Pharmacy Inventory & Laboratory Tracking</span>
            </div>
          </div>

          <div className="login-security-footer">
            <ShieldCheck size={16} color="#94a3b8" />
            <span>256-bit Encrypted Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}