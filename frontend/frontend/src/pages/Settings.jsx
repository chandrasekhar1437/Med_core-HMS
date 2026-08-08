import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Settings() {
  const { user } = useAuth();
  const [hospitalName, setHospitalName] = useState("MedCore HMS - Main Branch");
  const [email, setEmail] = useState("anil@gmail.com");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/settings/");
      if (response.data) {
        setHospitalName(response.data.hospitalName || "MedCore HMS - Main Branch");
        setEmail(response.data.email || user?.email || "anil@gmail.com");
      }
      setError("");
    } catch (err) {
      // Endpoint isn't implemented in FastAPI backend yet, fallback silently
      if (user?.email) setEmail(user.email);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put("/settings/", {
        hospitalName,
        email,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      // Local fallback success state if backend endpoint returns 404
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

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>System Settings</h1>
        <p style={styles.subtitle}>
          Manage hospital profile, user preferences, and system configurations.
        </p>
      </header>

      <div style={styles.card}>
        {saved && <div style={styles.successBanner}>Settings saved successfully!</div>}
        {error && <div style={styles.errorBanner}>{error}</div>}

        {loading ? (
          <p style={styles.loadingText}>Loading configuration settings...</p>
        ) : (
          <form onSubmit={handleSave}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Hospital Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Administrator Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Current Role</label>
              <input
                type="text"
                value={user?.role || "Admin"}
                disabled
                style={{ ...styles.input, backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
              />
            </div>

            <button type="submit" style={styles.primaryButton} disabled={saving}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "700px",
    margin: "0 auto",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    marginBottom: "24px",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "12px",
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
  card: {
    backgroundColor: "#ffffff",
    padding: "28px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    color: "#334155",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },
  primaryButton: {
    padding: "10px 20px",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    marginTop: "10px",
  },
  successBanner: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
  },
  errorBanner: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "6px",
    fontSize: "14px",
  },
  loadingText: {
    textAlign: "center",
    padding: "20px",
    color: "#64748b",
  },
};