import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, Lock, Send, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import axios from "axios";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Send Password Reset OTP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your registered Gmail address.");
      return;
    }
    setOtpLoading(true);
    setError("");
    setSuccess("");

    const cleanEmail = email.toLowerCase().trim();
    const payload = { email: cleanEmail };

    try {
      let response;

      // Clean routing: API instance already appends /api/v1
      try {
        response = await API.post("/auth/send-otp", payload);
      } catch (err1) {
        if (err1.response && err1.response.status === 404) {
          const baseURL = API.defaults.baseURL || "https://medcore-hms.onrender.com";
          const cleanBase = baseURL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
          response = await axios.post(`${cleanBase}/api/v1/auth/send-otp`, payload);
        } else {
          throw err1;
        }
      }

      setOtpSent(true);
      setSuccess(`Password reset OTP code sent to ${cleanEmail}. Check your inbox.`);
    } catch (err) {
      console.error("Send OTP Error:", err);
      setError(
        err.response?.data?.detail || "Failed to send reset code. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Submit Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp.trim() || !newPassword.trim()) {
      setError("Please enter both the OTP code and your new password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      email: email.toLowerCase().trim(),
      otp: otp.trim(),
      new_password: newPassword.trim(),
    };

    try {
      let response;

      try {
        response = await API.post("/auth/reset-password-otp", payload);
      } catch (err1) {
        if (err1.response && err1.response.status === 404) {
          const baseURL = API.defaults.baseURL || "https://medcore-hms.onrender.com";
          const cleanBase = baseURL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
          response = await axios.post(`${cleanBase}/api/v1/auth/reset-password-otp`, payload);
        } else {
          throw err1;
        }
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset Password Error:", err);
      setError(err.response?.data?.detail || "Failed to reset password. Check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", color: "#fff", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "28px" }}>
        
        <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#38bdf8", textDecoration: "none", fontSize: "13px", marginBottom: "20px" }}>
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "6px" }}>Forgot Password</h2>
        <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>Enter your registered Gmail to receive a password reset OTP code.</p>

        {error && (
          <div style={{ padding: "10px 12px", backgroundColor: "#450a0a", border: "1px solid #ef4444", color: "#fca5a5", borderRadius: "6px", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {success && (
          <div style={{ padding: "10px 12px", backgroundColor: "#064e3b", border: "1px solid #10b981", color: "#6ee7b7", borderRadius: "6px", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> {success}
          </div>
        )}

        <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "6px" }}>Gmail Address</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                required
                autoComplete="off"
                style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff", boxSizing: "border-box" }}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading}
                style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", padding: "6px 12px", backgroundColor: "#0284c7", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
              >
                {otpLoading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
              </button>
            </div>
          </div>

          {otpSent && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "6px" }}>6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "6px" }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff", boxSizing: "border-box" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ padding: "12px", backgroundColor: "#0284c7", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", marginTop: "8px" }}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}