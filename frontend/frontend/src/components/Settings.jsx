import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Settings() {
  const { user } = useAuth();
  const [hospitalName, setHospitalName] = useState("MedCore HMS - Main Branch");
  const [email, setEmail] = useState("admin@medcore.com");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Fetch current system settings from FastAPI backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/settings/");
      if (response.data) {
        setHospitalName(response.data.hospitalName || "MedCore HMS - Main Branch");
        setEmail(response.data.email || user?.email || "admin@medcore.com");
      }
      setError("");
    } catch (err) {
      console.error("Error fetching settings:", err);
      // Fallback to user context or default values
      if (user?.email) setEmail(user.email);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  // Save updated settings via PUT request
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
      console.error("Error saving settings:", err);
      const serverMessage = err.response?.data?.detail;
      setError(
        typeof serverMessage === "string"
          ? serverMessage
          : "Failed to save settings to server."
      );
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
        {saved && (
          <div style={styles.successBanner}>
            Settings saved successfully!
          </div>
        )}

        {error && (
          <div style={styles.errorBanner}>
            {error}
          </div>
        )}

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
                value={user?.role || "Administrator"}
                disabled
                style={{ ...styles.input, backgroundColor: "#f1f5f9" }}
              />
            </div>

            <button
              type="submit"
              style={styles.primaryButton}
              disabled={saving}
            >
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
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    marginBottom: "24px",
    borderBottom: "2px solid #eaeaea",
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
    padding: "24px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  formGroup: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    color: "#475569",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
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
    backgroundColor: "#d1e7dd",
    color: "#0f5132",
    borderRadius: "6px",
    fontSize: "14px",
  },
  errorBanner: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#f8d7da",
    color: "#842029",
    borderRadius: "6px",
    fontSize: "14px",
  },
  loadingText: {
    textAlign: "center",
    padding: "20px",
    color: "#64748b",
  },
};