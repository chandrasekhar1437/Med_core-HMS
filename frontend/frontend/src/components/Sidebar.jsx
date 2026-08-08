import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  DollarSign,
  Activity,
  Pill,
  FlaskConical,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Patients", path: "/patients", icon: <Users size={20} /> },
    { name: "Doctors", path: "/doctors", icon: <UserCheck size={20} /> },
    { name: "Appointments", path: "/appointments", icon: <Calendar size={20} /> },
    { name: "Prescriptions", path: "/prescriptions", icon: <FileText size={20} /> },
    { name: "Billing", path: "/billing", icon: <DollarSign size={20} /> },
    { name: "Medical Records", path: "/medical-records", icon: <Activity size={20} /> },
    { name: "Pharmacy", path: "/pharmacy", icon: <Pill size={20} /> },
    { name: "Laboratory", path: "/laboratory", icon: <FlaskConical size={20} /> },
    { name: "Settings", path: "/settings", icon: <SettingsIcon size={20} /> },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* App Branding */}
      <div style={styles.brandContainer}>
        <h2 style={styles.brandTitle}>MedCore HMS</h2>
        <span style={styles.brandSubtitle}>Hospital Ops System</span>
      </div>

      {/* Navigation Links */}
      <nav style={styles.navContainer}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.activeNavLink : {}),
            })}
          >
            <span style={styles.iconWrapper}>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout Button */}
      <div style={styles.userFooter}>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.name || "Admin Staff"}</span>
          <span style={styles.userEmail}>{user?.email || "anil@gmail.com"}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "250px",
    height: "100vh",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    position: "fixed",
    top: 0,
    left: 0,
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
  },
  brandContainer: {
    padding: "1.5rem 1.25rem",
    borderBottom: "1px solid #1e293b",
  },
  brandTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#38bdf8",
  },
  brandSubtitle: {
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
  navContainer: {
    flex: 1,
    padding: "1rem 0.75rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "0.375rem",
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  activeNavLink: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    fontWeight: "600",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
  },
  userFooter: {
    padding: "1rem 1.25rem",
    borderTop: "1px solid #1e293b",
    backgroundColor: "#0b1329",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "0.75rem",
  },
  userName: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#f8fafc",
  },
  userEmail: {
    fontSize: "0.75rem",
    color: "#64748b",
  },
  logoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
  },
};