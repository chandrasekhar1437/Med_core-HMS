import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = (user?.role || "admin").toLowerCase();

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>MedCore HMS</div>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.link}>
          Dashboard
        </Link>

        {/* PATIENTS: Health Records, Appointments, Prescriptions */}
        {role === "patient" && (
          <>
            <Link to="/medical-records" style={styles.link}>
              Health Records
            </Link>
            <Link to="/appointments" style={styles.link}>
              Appointments
            </Link>
            <Link to="/prescriptions" style={styles.link}>
              Prescriptions
            </Link>
          </>
        )}

        {/* DOCTORS: Schedule, Patient List, Treatment Notes */}
        {role === "doctor" && (
          <>
            <Link to="/appointments" style={styles.link}>
              Schedule
            </Link>
            <Link to="/patients" style={styles.link}>
              Patient List
            </Link>
            <Link to="/prescriptions" style={styles.link}>
              Treatment Notes
            </Link>
          </>
        )}

        {/* ADMIN / STAFF: Billing, Appointments, Patient Registration */}
        {(role === "admin" || role === "staff") && (
          <>
            <Link to="/patients" style={styles.link}>
              Patient Registration
            </Link>
            <Link to="/appointments" style={styles.link}>
              Appointments
            </Link>
            <Link to="/billing" style={styles.link}>
              Billing
            </Link>
            <Link to="/doctors" style={styles.link}>
              Doctors
            </Link>
            <Link to="/pharmacy" style={styles.link}>
              Pharmacy
            </Link>
            <Link to="/laboratory" style={styles.link}>
              Laboratory
            </Link>
          </>
        )}

        {/* NURSES: Assigned Tasks, Vital Signs, Medication Schedules */}
        {role === "nurse" && (
          <>
            <Link to="/patients" style={styles.link}>
              Assigned Tasks
            </Link>
            <Link to="/medical-records" style={styles.link}>
              Vital Signs Tracking
            </Link>
            <Link to="/pharmacy" style={styles.link}>
              Medication Schedules
            </Link>
          </>
        )}

        {isAuthenticated ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", color: "#f59e0b", fontWeight: "600" }}>
              {user?.email || "User"} ({user?.role || "User"})
            </span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" style={styles.loginLink}>
            Login/Register
          </Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: "15px 30px",
    color: "#ffffff",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  brand: {
    fontSize: "20px",
    fontWeight: "bold",
    letterSpacing: "0.5px",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },
  loginLink: {
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    padding: "6px 14px",
    borderRadius: "4px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};