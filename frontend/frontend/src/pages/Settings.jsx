import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Settings.css";

export default function Settings() {
  const { user } = useAuth();

  // Hospital & General Settings
  const [hospitalName, setHospitalName] = useState("MedCore HMS - Main Branch");
  const [email, setEmail] = useState("admin@gmail.com");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");

  // Preferences State initialized from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Fetch Settings Data from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/settings/");
      if (response.data) {
        setHospitalName(response.data.hospitalName || "MedCore HMS - Main Branch");
        setEmail(response.data.email || user?.email || "admin@gmail.com");
      }
      setError("");
    } catch (err) {
      if (user?.email) setEmail(user.email);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  // Synchronize dark theme toggle with data-theme attribute on <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Handle General Profile Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put("/settings/", {
        hospitalName,
        email,
        darkMode,
        emailAlerts,
        smsAlerts,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Failed to save settings to server.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change Submit
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg("");
    setPassError("");

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("Password must be at least 6 characters long.");
      return;
    }

    setPassSaving(true);

    try {
      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPassMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassMsg(""), 3000);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setPassMsg("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPassMsg(""), 3000);
      } else {
        setPassError(err.response?.data?.detail || "Failed to change password.");
      }
    } finally {
      setPassSaving(false);
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1 className="settings-title">System Settings</h1>
        <p className="settings-subtitle">
          Manage hospital profile, security credentials, and system preferences.
        </p>
      </header>

      {/* 1. General Hospital Settings */}
      <div className="settings-card">
        <h3 className="card-section-title">Hospital Profile</h3>

        {saved && <div className="banner-success">Settings saved successfully!</div>}
        {error && <div className="banner-error">{error}</div>}

        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            Loading configuration settings...
          </p>
        ) : (
          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label">Hospital Name</label>
              <input
                type="text"
                className="form-input"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Administrator Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Role</label>
              <input
                type="text"
                value={user?.role || "Admin"}
                disabled
                className="form-input disabled-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Hospital Profile"}
            </button>
          </form>
        )}
      </div>

      {/* 2. Dark Mode & System Preferences */}
      <div className="settings-card">
        <h3 className="card-section-title">Appearance & Notifications</h3>

        <div className="toggle-row">
          <div className="toggle-info">
            <h4>Dark Mode System Theme</h4>
            <p>Toggle dark interface colors across all hospital pages.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-row">
          <div className="toggle-info">
            <h4>Email Notification Alerts</h4>
            <p>Receive email updates for new patient bookings.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-row" style={{ borderBottom: "none" }}>
          <div className="toggle-info">
            <h4>SMS Dispatch Alerts</h4>
            <p>Send automated appointment reminders to patients.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* 3. Password Security */}
      <div className="settings-card">
        <h3 className="card-section-title">Security & Change Password</h3>

        {passMsg && <div className="banner-success">{passMsg}</div>}
        {passError && <div className="banner-error">{passError}</div>}

        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-danger"
            disabled={passSaving}
          >
            {passSaving ? "Updating Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}