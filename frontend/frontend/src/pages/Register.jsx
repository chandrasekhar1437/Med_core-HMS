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

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password: password,
      role: role,
    };

    try {
      const response = await API.post("/auth/register", payload);
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
        setError("Registration failed (404 / Server error). Check backend terminal.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.registerCard}>
        <div style={styles.brandPanel}>
          <div style={styles.brandHeader}>
            <div style={styles.logoBadge}>
              <Activity size={28} color="#38bdf8" />
            </div>
            <div>
              <h2 style={styles.brandTitle}>MedCore HMS</h2>
              <p style={styles.brandSubtitle}>Healthcare Operations Suite</p>
            </div>
          </div>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Streamlined Staff & Patient Onboarding</span>
            </div>
            <div style={styles.featureItem}>
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Role-Based Portal Access Control</span>
            </div>
            <div style={styles.featureItem}>
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Instant Appointment Booking & E-Prescriptions</span>
            </div>
            <div style={styles.featureItem}>
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Secure Patient Electronic Health Records</span>
            </div>
          </div>

          <div style={styles.securityFooter}>
            <ShieldCheck size={16} color="#94a3b8" />
            <span>Encrypted HIPAA Compliant Platform</span>
          </div>
        </div>

        <div style={styles.formPanel}>
          <div style={styles.formHeader}>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>
              Register a new account to access hospital management tools
            </p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} color="#991b1b" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. John Doe"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@medcore.com"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Account Role</label>
              <div style={styles.inputWrapper}>
                <UserCheck size={18} color="#94a3b8" style={styles.inputIcon} />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist / Staff</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
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

          <div style={styles.loginFooter}>
            <span>Already have an account? </span>
            <Link to="/login" style={styles.loginLink}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    backgroundImage: "radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)",
    padding: "20px",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  registerCard: {
    display: "flex",
    width: "100%",
    maxWidth: "920px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
  },
  brandPanel: {
    flex: "1",
    backgroundColor: "#0b1329",
    color: "#ffffff",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid #1e293b",
    minWidth: "340px",
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoBadge: {
    padding: "10px",
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#38bdf8",
    letterSpacing: "-0.5px",
  },
  brandSubtitle: {
    margin: "2px 0 0 0",
    fontSize: "13px",
    color: "#94a3b8",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    margin: "40px 0",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    color: "#cbd5e1",
    lineHeight: "1.4",
  },
  securityFooter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#64748b",
  },
  formPanel: {
    flex: "1.2",
    padding: "40px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  formHeader: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    marginBottom: "16px",
    fontSize: "13px",
  },
  inputGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "6px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "11px 14px 11px 42px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  },
  selectInput: {
    width: "100%",
    padding: "11px 14px 11px 42px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  loginFooter: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
  },
  loginLink: {
    color: "#0284c7",
    fontWeight: "600",
    textDecoration: "none",
  },
};