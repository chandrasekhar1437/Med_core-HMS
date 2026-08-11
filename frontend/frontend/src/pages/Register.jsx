import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Activity,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Patient");
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

    const payload = {
      name: cleanName,
      full_name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: role,
    };

    try {
      let response;
      try {
        response = await API.post("/auth/register", payload);
      } catch (firstErr) {
        if (firstErr.response && firstErr.response.status === 404) {
          response = await API.post("/api/v1/auth/register", payload);
        } else {
          throw firstErr;
        }
      }

      const { access_token, user } = response.data;

      const handleAuthLogin = loginUser || login;
      if (typeof handleAuthLogin === "function") {
        handleAuthLogin(access_token, user);
      } else {
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
      }

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
            <h1 className="register-form-title">Create Account</h1>
            <p className="register-form-subtitle">
              Register a new account to access hospital management tools
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
                  placeholder="Dr. John Doe"
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
                  placeholder="user@medcore.com"
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
              <div className="register-input-wrapper">
                <Lock size={18} color="#94a3b8" className="register-input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="register-field-input"
                />
              </div>
            </div>

            <div className="register-input-group">
              <label className="register-input-label">Account Role</label>
              <div className="register-input-wrapper">
                <UserCheck size={18} color="#94a3b8" className="register-input-icon" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="register-select-input"
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Staff">Medical Staff / Nurse</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="register-submit-btn">
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Register Account</span>
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
              <p className="register-brand-subtitle">Healthcare Operations Suite</p>
            </div>
          </div>

          <div className="register-feature-list">
            <div className="register-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Streamlined Staff & Patient Onboarding</span>
            </div>
            <div className="register-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Role-Based Portal Access Control</span>
            </div>
            <div className="register-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Instant Appointment Booking & E-Prescriptions</span>
            </div>
            <div className="register-feature-item">
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Secure Patient Electronic Health Records</span>
            </div>
          </div>

          <div className="register-security-footer">
            <ShieldCheck size={16} color="#94a3b8" />
            <span>Encrypted HIPAA Compliant Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}