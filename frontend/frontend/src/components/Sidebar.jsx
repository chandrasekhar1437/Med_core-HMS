import React, { useState } from "react";
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
  BedDouble,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (user?.role || "patient").toLowerCase();

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/login");
  };

  const closeMenu = () => setMobileOpen(false);

  // Define navigation items based on user role
  const navByRole = {
    admin: [
      { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
      { name: "Staff & Doctors", path: "/doctors", icon: <UserCheck size={20} /> },
      { name: "Patient Records", path: "/patients", icon: <Users size={20} /> },
      { name: "Appointments", path: "/appointments", icon: <Calendar size={20} /> },
      { name: "Ward & Beds", path: "/ward-management", icon: <BedDouble size={20} /> },
      { name: "Financials & Billing", path: "/billing", icon: <DollarSign size={20} /> },
      { name: "Pharmacy Stock", path: "/pharmacy", icon: <Pill size={20} /> },
      { name: "Laboratory", path: "/laboratory", icon: <FlaskConical size={20} /> },
      { name: "Settings", path: "/settings", icon: <SettingsIcon size={20} /> },
    ],
    doctor: [
      { name: "Doctor Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
      { name: "Appointment Queue", path: "/appointments", icon: <Calendar size={20} /> },
      { name: "My Patients", path: "/patients", icon: <Users size={20} /> },
      { name: "Ward Occupancy", path: "/ward-management", icon: <BedDouble size={20} /> },
      { name: "EHR & Medical Notes", path: "/medical-records", icon: <Activity size={20} /> },
      { name: "Digital Prescriptions", path: "/prescriptions", icon: <FileText size={20} /> },
    ],
    nurse: [
      { name: "Staff Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
      { name: "Patient Registration", path: "/patients", icon: <Users size={20} /> },
      { name: "Ward & Bed Allocation", path: "/ward-management", icon: <BedDouble size={20} /> },
      { name: "Appointments Queue", path: "/appointments", icon: <Calendar size={20} /> },
      { name: "Vital Signs Log", path: "/medical-records", icon: <Activity size={20} /> },
      { name: "Pharmacy Orders", path: "/pharmacy", icon: <Pill size={20} /> },
    ],
    staff: [
      { name: "Staff Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
      { name: "Patient Registration", path: "/patients", icon: <Users size={20} /> },
      { name: "Ward & Bed Allocation", path: "/ward-management", icon: <BedDouble size={20} /> },
      { name: "Appointments Queue", path: "/appointments", icon: <Calendar size={20} /> },
      { name: "Vital Signs Log", path: "/medical-records", icon: <Activity size={20} /> },
      { name: "Pharmacy Orders", path: "/pharmacy", icon: <Pill size={20} /> },
    ],
    patient: [
      { name: "Patient Portal", path: "/", icon: <LayoutDashboard size={20} /> },
      { name: "Book Appointment", path: "/appointments", icon: <Calendar size={20} /> },
      { name: "Health Records", path: "/medical-records", icon: <Activity size={20} /> },
      { name: "My Prescriptions", path: "/prescriptions", icon: <FileText size={20} /> },
      { name: "Invoices & Billing", path: "/billing", icon: <DollarSign size={20} /> },
    ],
  };

  const navItems = navByRole[role] || navByRole.patient;

  return (
    <>
      <style>{`
        /* Mobile Top Header for Sidebar Toggle */
        .sidebar-mobile-topbar {
          display: none;
          justify-content: space-between;
          align-items: center;
          background-color: #0f172a;
          color: #ffffff;
          padding: 12px 16px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .sidebar-mobile-title {
          font-size: 1.1rem;
          font-weight: bold;
          color: #38bdf8;
        }

        .sidebar-hamburger-btn {
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 4px;
        }

        /* Sidebar Main Layout */
        .sidebar-root {
          width: 250px;
          height: 100vh;
          background-color: #0f172a;
          color: #f8fafc;
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          z-index: 1001;
          transition: transform 0.3s ease;
        }

        .role-pill {
          display: inline-block;
          font-size: 0.7rem;
          text-transform: uppercase;
          background-color: #0284c7;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 4px;
          margin-top: 4px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .sidebar-backdrop {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar-mobile-topbar {
            display: flex;
          }

          .sidebar-root {
            transform: translateX(-100%);
          }

          .sidebar-root.is-mobile-open {
            transform: translateX(0);
          }

          .sidebar-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background-color: rgba(15, 23, 42, 0.6);
            z-index: 999;
            backdrop-filter: blur(2px);
          }
        }
      `}</style>

      {/* Mobile Bar Header */}
      <div className="sidebar-mobile-topbar">
        <span className="sidebar-mobile-title">MedCore HMS</span>
        <button
          className="sidebar-hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Sidebar Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Drawer */}
      <aside className={`sidebar-root ${mobileOpen ? "is-mobile-open" : ""}`}>
        {/* App Branding & Role Badge */}
        <div style={styles.brandContainer}>
          <h2 style={styles.brandTitle}>MedCore HMS</h2>
          <span className="role-pill">{role} portal</span>
        </div>

        {/* Navigation Links */}
        <nav style={styles.navContainer}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeMenu}
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
            <span style={styles.userName}>{user?.name || user?.full_name || "Authorized User"}</span>
            <span style={styles.userEmail}>{user?.email || "user@medcore.com"}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && <div className="sidebar-backdrop" onClick={closeMenu} />}
    </>
  );
}

const styles = {
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