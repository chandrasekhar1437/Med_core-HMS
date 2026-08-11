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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("anil@gmail.com");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginUser, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    try {
      const response = await API.post("/auth/login", {
        email: cleanEmail,
        password: cleanPassword,
        role: role,
      });

      const { access_token, user } = response.data;
      const userData = user || {
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
        role: role,
      };

      const handleAuthLogin = loginUser || login;
      if (typeof handleAuthLogin === "function") {
        handleAuthLogin(access_token, userData);
      } else {
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(userData));
      }

      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
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
                  placeholder="admin@medcore.com"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="login-field-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-input-group">
              <label className="login-input-label">Password</label>
              <div className="login-input-wrapper">
                <Lock size={18} color="#94a3b8" className="login-input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="login-field-input"
                />
              </div>
            </div>

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
              Create staff account
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