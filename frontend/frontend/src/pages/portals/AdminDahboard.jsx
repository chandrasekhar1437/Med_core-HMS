import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  DollarSign,
  PackageCheck,
} from "lucide-react";
import API from "../../services/api";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Doctor");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [usersList, setUsersList] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      let res;
      try {
        res = await API.get("/api/v1/users/");
      } catch {
        res = await API.get("/users/");
      }
      setUsersList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users list:", err);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

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
      try {
        await API.post("/api/v1/users/", payload);
      } catch (err1) {
        if (err1.response && err1.response.status === 404) {
          await API.post("/users/", payload);
        } else {
          throw err1;
        }
      }

      setMessage({
        type: "success",
        text: `${role} account for ${cleanName} provisioned successfully!`,
      });

      setName("");
      setEmail("");
      setPassword("");
      fetchUsers();
    } catch (err) {
      console.error("Account provision error:", err);
      setMessage({
        type: "error",
        text:
          err.response?.data?.detail ||
          "Failed to create account. User may already exist.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate active staff count dynamically
  const activeStaffCount = usersList.filter((u) => {
    const r = (u.role || "").toLowerCase();
    return r === "doctor" || r === "staff" || r === "admin";
  }).length;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={styles.headerBanner}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px 0", color: "#f8fafc" }}>
            ⚙️ Admin Command Center
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
            Manage system settings, staff roles, and financial structures.
          </p>
        </div>
        <div style={styles.badge}>
          <ShieldCheck size={18} color="#38bdf8" />
          <span>System Administrator</span>
        </div>
      </div>

      {/* Metrics Summary Stats Bar */}
      <div style={styles.statsGrid}>
        <div style={styles.metricCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={styles.metricTitle}>Total Staff & Doctors</h4>
            <Users size={20} color="#38bdf8" />
          </div>
          <p style={styles.metricValue}>
            {activeStaffCount > 0 ? `${activeStaffCount} Active` : "24 Active"}
          </p>
        </div>

        <div style={styles.metricCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={styles.metricTitle}>Monthly Revenue</h4>
            <DollarSign size={20} color="#10b981" />
          </div>
          <p style={styles.metricValue}>$42,850</p>
        </div>

        <div style={styles.metricCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={styles.metricTitle}>Inventory Health</h4>
            <PackageCheck size={20} color="#10b981" />
          </div>
          <p style={{ ...styles.metricValue, color: "#10b981" }}>98% In Stock</p>
        </div>
      </div>

      {/* Grid Layout: Account Provisioning + User Roster */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* Left Column: Account Creation Form */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <UserPlus size={22} color="#38bdf8" />
            <h2 style={styles.cardTitle}>Provision Staff & Doctor Credentials</h2>
          </div>

          {message.text && (
            <div
              style={{
                ...styles.alert,
                backgroundColor: message.type === "success" ? "#064e3b" : "#450a0a",
                borderColor: message.type === "success" ? "#10b981" : "#ef4444",
                color: message.type === "success" ? "#6ee7b7" : "#fca5a5",
              }}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateAccount} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={styles.label}>Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.select}
              >
                <option value="Doctor">Doctor</option>
                <option value="Staff">Medical Staff / Nurse</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Sarah Jenkins"
                required
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@medcore.com"
                required
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Initial Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Provisioning Credentials..." : `Create ${role} Account`}
            </button>
          </form>
        </div>

        {/* Right Column: Active System Users Overview */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Users size={22} color="#38bdf8" />
            <h2 style={styles.cardTitle}>Registered Accounts Overview</h2>
          </div>

          <div style={{ overflowY: "auto", maxHeight: "380px" }}>
            {fetchingUsers ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>Loading account list...</p>
            ) : usersList.length === 0 ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>No registered users found.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8", fontSize: "12px" }}>
                    <th style={{ padding: "8px" }}>Name</th>
                    <th style={{ padding: "8px" }}>Email</th>
                    <th style={{ padding: "8px" }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u, i) => (
                    <tr key={u.id || i} style={{ borderBottom: "1px solid #1e293b", fontSize: "13px", color: "#e2e8f0" }}>
                      <td style={{ padding: "10px 8px" }}>{u.full_name || u.name || "User"}</td>
                      <td style={{ padding: "10px 8px", color: "#94a3b8" }}>{u.email}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={getRoleBadgeStyle(u.role)}>
                          {u.role || "Patient"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function getRoleBadgeStyle(role) {
  const r = (role || "").toLowerCase();
  let bg = "#334155";
  let color = "#cbd5e1";

  if (r === "admin") { bg = "#831843"; color = "#f472b6"; }
  else if (r === "doctor") { bg = "#0c4a6e"; color = "#38bdf8"; }
  else if (r === "staff") { bg = "#064e3b"; color = "#34d399"; }

  return {
    backgroundColor: bg,
    color: color,
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
  };
}

const styles = {
  headerBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    padding: "20px 24px",
    borderRadius: "12px",
    marginBottom: "24px",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#0f172a",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#e2e8f0",
    border: "1px solid #334155",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  metricCard: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "18px",
  },
  metricTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    margin: 0,
  },
  metricValue: {
    fontSize: "1.6rem",
    fontWeight: "700",
    margin: "10px 0 0 0",
    color: "#0284c7",
  },
  card: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "24px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0,
  },
  alert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#cbd5e1",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  submitBtn: {
    marginTop: "8px",
    padding: "12px",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};