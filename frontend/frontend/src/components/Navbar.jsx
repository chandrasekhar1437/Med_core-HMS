import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate("/login");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const role = (user?.role || "admin").toLowerCase();

  return (
    <nav className="navbar-container">
      <style>{`
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #1e293b;
          padding: 14px 24px;
          color: #ffffff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1100;
        }

        .navbar-brand {
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 0.5px;
          color: #38bdf8;
          text-decoration: none;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .navbar-link {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .navbar-link:hover {
          color: #ffffff;
        }

        .navbar-login-btn {
          background-color: #f59e0b;
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .navbar-logout-btn {
          background-color: #ef4444;
          color: #ffffff;
          border: none;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .navbar-toggle-btn {
          display: none;
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 4px;
        }

        .navbar-overlay {
          display: none;
        }

        /* Mobile Responsive View */
        @media (max-width: 768px) {
          .navbar-container {
            padding: 12px 16px;
          }

          .navbar-toggle-btn {
            display: block;
          }

          .navbar-links {
            position: fixed;
            top: 0;
            right: -280px;
            bottom: 0;
            width: 250px;
            background-color: #1e293b;
            flex-direction: column;
            align-items: flex-start;
            padding: 70px 20px 20px 20px;
            gap: 16px;
            transition: right 0.3s ease;
            box-shadow: -4px 0 12px rgba(0,0,0,0.3);
            z-index: 1200;
          }

          .navbar-links.mobile-open {
            right: 0;
          }

          .navbar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background-color: rgba(15, 23, 42, 0.6);
            z-index: 1150;
            backdrop-filter: blur(2px);
          }
        }
      `}</style>

      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        MedCore HMS
      </Link>

      <button
        className="navbar-toggle-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Navigation"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileMenuOpen && (
        <div className="navbar-overlay" onClick={closeMenu} />
      )}

      <div className={`navbar-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <Link to="/" className="navbar-link" onClick={closeMenu}>
          Dashboard
        </Link>

        {/* PATIENTS */}
        {role === "patient" && (
          <>
            <Link to="/medical-records" className="navbar-link" onClick={closeMenu}>
              Health Records
            </Link>
            <Link to="/appointments" className="navbar-link" onClick={closeMenu}>
              Appointments
            </Link>
            <Link to="/prescriptions" className="navbar-link" onClick={closeMenu}>
              Prescriptions
            </Link>
          </>
        )}

        {/* DOCTORS */}
        {role === "doctor" && (
          <>
            <Link to="/appointments" className="navbar-link" onClick={closeMenu}>
              Schedule
            </Link>
            <Link to="/patients" className="navbar-link" onClick={closeMenu}>
              Patient List
            </Link>
            <Link to="/prescriptions" className="navbar-link" onClick={closeMenu}>
              Treatment Notes
            </Link>
          </>
        )}

        {/* ADMIN / STAFF */}
        {(role === "admin" || role === "staff") && (
          <>
            <Link to="/patients" className="navbar-link" onClick={closeMenu}>
              Patient Registration
            </Link>
            <Link to="/appointments" className="navbar-link" onClick={closeMenu}>
              Appointments
            </Link>
            <Link to="/billing" className="navbar-link" onClick={closeMenu}>
              Billing
            </Link>
            <Link to="/doctors" className="navbar-link" onClick={closeMenu}>
              Doctors
            </Link>
            <Link to="/pharmacy" className="navbar-link" onClick={closeMenu}>
              Pharmacy
            </Link>
            <Link to="/laboratory" className="navbar-link" onClick={closeMenu}>
              Laboratory
            </Link>
          </>
        )}

        {/* NURSES */}
        {role === "nurse" && (
          <>
            <Link to="/patients" className="navbar-link" onClick={closeMenu}>
              Assigned Tasks
            </Link>
            <Link to="/medical-records" className="navbar-link" onClick={closeMenu}>
              Vital Signs Tracking
            </Link>
            <Link to="/pharmacy" className="navbar-link" onClick={closeMenu}>
              Medication Schedules
            </Link>
          </>
        )}

        {isAuthenticated ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            <span style={{ fontSize: "13px", color: "#f59e0b", fontWeight: "600" }}>
              {user?.email || "User"} ({user?.role || "User"})
            </span>
            <button onClick={handleLogout} className="navbar-logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="navbar-login-btn" onClick={closeMenu}>
            Login/Register
          </Link>
        )}
      </div>
    </nav>
  );
}