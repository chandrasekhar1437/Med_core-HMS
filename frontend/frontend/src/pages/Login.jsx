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

    // Normalize inputs for mobile browser compatibility
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

      // Call authentication login method safely
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
    <div style={styles.pageContainer}>
      <div style={styles.loginCard}>
        {/* Left Side Form Panel */}
        <div style={styles.formPanel}>
          <div style={styles.formHeader}>
            <h1 style={styles.title}>Sign In</h1>
            <p style={styles.subtitle}>
              Select your role and enter your credentials to access your portal account
            </p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} color="#991b1b" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoCapitalize="none" autoCorrect="off">
            {/* Role Selection Dropdown */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Role</label>
              <div style={styles.inputWrapper}>
                <UserCheck size={18} color="#94a3b8" style={styles.inputIcon} />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="Admin">Administrator</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Patient">Patient</option>
                  <option value="Staff">Medical Staff / Nurse</option>
                </select>
              </div>
            </div>

            {/* Email Address */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@medcore.com"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
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

          <div style={styles.registerFooter}>
            <span>Don't have an account? </span>
            <Link to="/register" style={styles.registerLink}>
              Create staff account
            </Link>
          </div>
        </div>

        {/* Right Side Decorative Panel */}
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
              <span>Real-time Patient Records & Medical Charts</span>
            </div>
            <div style={styles.featureItem}>
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Doctor Scheduling & Appointment Booking</span>
            </div>
            <div style={styles.featureItem}>
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Integrated Billing, PDF Invoices & Analytics</span>
            </div>
            <div style={styles.featureItem}>
              <CheckCircle2 size={18} color="#38bdf8" />
              <span>Pharmacy Inventory & Laboratory Tracking</span>
            </div>
          </div>

          <div style={styles.securityFooter}>
            <ShieldCheck size={16} color="#94a3b8" />
            <span>256-bit Encrypted Portal</span>
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
  loginCard: {
    display: "flex",
    width: "100%",
    maxWidth: "920px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
  },
  formPanel: {
    flex: "1.2",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e2e8f0",
  },
  brandPanel: {
    flex: "1",
    backgroundColor: "#0b1329",
    color: "#ffffff",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
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
  formHeader: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "14px",
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
    marginBottom: "20px",
    fontSize: "13px",
  },
  inputGroup: {
    marginBottom: "18px",
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
    padding: "12px 14px 12px 42px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  },
  selectInput: {
    width: "100%",
    padding: "12px 14px 12px 42px",
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
    padding: "13px",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  registerFooter: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
  },
  registerLink: {
    color: "#0284c7",
    fontWeight: "600",
    textDecoration: "none",
  },
};