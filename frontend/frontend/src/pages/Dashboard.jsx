import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Normalize user role string
  const role = (user?.role || "Patient").toLowerCase();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="mobile-brand">
          <h2>MedCore HMS</h2>
          <span className="role-badge">{user?.role || "Patient"}</span>
        </div>
        <button
          className="hamburger-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <h2>MedCore HMS</h2>
          <span className="role-subtitle">
            {user?.role || "Patient"} Portal
          </span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="active" onClick={closeMobileMenu}>
            Dashboard
          </Link>

          {/* PATIENT LINKS */}
          {role === "patient" && (
            <>
              <Link to="/medical-records" onClick={closeMobileMenu}>Health Records</Link>
              <Link to="/appointments" onClick={closeMobileMenu}>My Appointments</Link>
              <Link to="/prescriptions" onClick={closeMobileMenu}>My Prescriptions</Link>
            </>
          )}

          {/* DOCTOR LINKS */}
          {role === "doctor" && (
            <>
              <Link to="/appointments" onClick={closeMobileMenu}>My Schedule</Link>
              <Link to="/patients" onClick={closeMobileMenu}>Patient List</Link>
              <Link to="/prescriptions" onClick={closeMobileMenu}>Treatment Notes</Link>
            </>
          )}

          {/* ADMINISTRATIVE STAFF LINKS */}
          {(role === "admin" || role === "staff") && (
            <>
              <Link to="/billing" onClick={closeMobileMenu}>Billing & Financials</Link>
              <Link to="/appointments" onClick={closeMobileMenu}>Appointment Scheduling</Link>
              <Link to="/patients" onClick={closeMobileMenu}>Patient Registration</Link>
              <Link to="/doctors" onClick={closeMobileMenu}>Doctors</Link>
              <Link to="/pharmacy" onClick={closeMobileMenu}>Pharmacy</Link>
              <Link to="/laboratory" onClick={closeMobileMenu}>Laboratory</Link>
            </>
          )}

          {/* NURSE LINKS */}
          {role === "nurse" && (
            <>
              <Link to="/patients" onClick={closeMobileMenu}>Assigned Tasks</Link>
              <Link to="/medical-records" onClick={closeMobileMenu}>Vital Signs Tracking</Link>
              <Link to="/pharmacy" onClick={closeMobileMenu}>Medication Schedules</Link>
            </>
          )}

          <button
            onClick={() => {
              closeMobileMenu();
              logout();
            }}
            className="logout-btn"
          >
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Mobile Overlay Background */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Main Dynamic Content Area */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name || user?.email || "User"}!</p>
          </div>

          {/* Action button tailored to active role */}
          <button
            className="primary-btn"
            onClick={() => {
              if (role === "patient") navigate("/appointments");
              else if (role === "doctor") navigate("/prescriptions");
              else if (role === "nurse") navigate("/medical-records");
              else navigate("/patients");
            }}
          >
            {role === "patient" && "Book Appointment"}
            {role === "doctor" && "Add Treatment Note"}
            {role === "nurse" && "Log Patient Vitals"}
            {(role === "admin" || role === "staff") && "New Patient Registration"}
          </button>
        </header>

        {/* Dynamic Card Grid */}
        <div className="dashboard-cards">
          {/* 1. PATIENT FOCUS */}
          {role === "patient" && (
            <>
              <div
                className="card"
                onClick={() => navigate("/medical-records")}
              >
                <h3>Health Records</h3>
                <p>Access your medical diagnosis files, lab reports, and clinical history.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/appointments")}
              >
                <h3>Appointments</h3>
                <p>Schedule new consultations and track upcoming clinic visits.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/prescriptions")}
              >
                <h3>Prescriptions</h3>
                <p>View active medications, dosage instructions, and refill logs.</p>
              </div>
            </>
          )}

          {/* 2. DOCTOR FOCUS */}
          {role === "doctor" && (
            <>
              <div
                className="card"
                onClick={() => navigate("/appointments")}
              >
                <h3>Schedule</h3>
                <p>View upcoming patient visits, time slots, and consultation reasons.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/patients")}
              >
                <h3>Patient List</h3>
                <p>Browse assigned patient medical histories and active profiles.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/prescriptions")}
              >
                <h3>Treatment Notes</h3>
                <p>Record clinical progress notes and write electronic prescriptions.</p>
              </div>
            </>
          )}

          {/* 3. ADMINISTRATIVE STAFF FOCUS */}
          {(role === "admin" || role === "staff") && (
            <>
              <div
                className="card"
                onClick={() => navigate("/billing")}
              >
                <h3>Billing</h3>
                <p>Process patient payments, insurance claims, and pending invoices.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/appointments")}
              >
                <h3>Appointment Scheduling</h3>
                <p>Manage clinic time slots, assign doctors, and track bookings.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/patients")}
              >
                <h3>Patient Registration</h3>
                <p>Register new patient profiles and update personal intake records.</p>
              </div>
            </>
          )}

          {/* 4. NURSE FOCUS */}
          {role === "nurse" && (
            <>
              <div
                className="card"
                onClick={() => navigate("/patients")}
              >
                <h3>Assigned Tasks</h3>
                <p>Track daily ward duties, care plans, and patient requests.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/medical-records")}
              >
                <h3>Vital Signs Tracking</h3>
                <p>Record blood pressure, pulse, temperature, and oxygen levels.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/pharmacy")}
              >
                <h3>Medication Schedules</h3>
                <p>Monitor medicine dosage timetables and log administered meds.</p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}