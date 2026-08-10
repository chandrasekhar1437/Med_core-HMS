import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Normalize user role string
  const role = (user?.role || "Patient").toLowerCase();

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>MedCore HMS</h2>
          <span style={{ textTransform: "capitalize" }}>
            {user?.role || "Patient"} Portal
          </span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="active">
            Dashboard
          </Link>

          {/* PATIENT LINKS */}
          {role === "patient" && (
            <>
              <Link to="/medical-records">Health Records</Link>
              <Link to="/appointments">My Appointments</Link>
              <Link to="/prescriptions">My Prescriptions</Link>
            </>
          )}

          {/* DOCTOR LINKS */}
          {role === "doctor" && (
            <>
              <Link to="/appointments">My Schedule</Link>
              <Link to="/patients">Patient List</Link>
              <Link to="/prescriptions">Treatment Notes</Link>
            </>
          )}

          {/* ADMINISTRATIVE STAFF LINKS */}
          {(role === "admin" || role === "staff") && (
            <>
              <Link to="/billing">Billing & Financials</Link>
              <Link to="/appointments">Appointment Scheduling</Link>
              <Link to="/patients">Patient Registration</Link>
              <Link to="/doctors">Doctors</Link>
              <Link to="/pharmacy">Pharmacy</Link>
              <Link to="/laboratory">Laboratory</Link>
            </>
          )}

          {/* NURSE LINKS */}
          {role === "nurse" && (
            <>
              <Link to="/patients">Assigned Tasks</Link>
              <Link to="/medical-records">Vital Signs Tracking</Link>
              <Link to="/pharmacy">Medication Schedules</Link>
            </>
          )}

          <button onClick={logout} className="logout-btn">
            Sign Out
          </button>
        </nav>
      </aside>

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
        <div
          className="dashboard-cards"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {/* 1. PATIENT FOCUS */}
          {role === "patient" && (
            <>
              <div
                className="card"
                onClick={() => navigate("/medical-records")}
                style={{ cursor: "pointer" }}
              >
                <h3>Health Records</h3>
                <p>Access your medical diagnosis files, lab reports, and clinical history.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/appointments")}
                style={{ cursor: "pointer" }}
              >
                <h3>Appointments</h3>
                <p>Schedule new consultations and track upcoming clinic visits.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/prescriptions")}
                style={{ cursor: "pointer" }}
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
                style={{ cursor: "pointer" }}
              >
                <h3>Schedule</h3>
                <p>View upcoming patient visits, time slots, and consultation reasons.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/patients")}
                style={{ cursor: "pointer" }}
              >
                <h3>Patient List</h3>
                <p>Browse assigned patient medical histories and active profiles.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/prescriptions")}
                style={{ cursor: "pointer" }}
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
                style={{ cursor: "pointer" }}
              >
                <h3>Billing</h3>
                <p>Process patient payments, insurance claims, and pending invoices.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/appointments")}
                style={{ cursor: "pointer" }}
              >
                <h3>Appointment Scheduling</h3>
                <p>Manage clinic time slots, assign doctors, and track bookings.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/patients")}
                style={{ cursor: "pointer" }}
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
                style={{ cursor: "pointer" }}
              >
                <h3>Assigned Tasks</h3>
                <p>Track daily ward duties, care plans, and patient requests.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/medical-records")}
                style={{ cursor: "pointer" }}
              >
                <h3>Vital Signs Tracking</h3>
                <p>Record blood pressure, pulse, temperature, and oxygen levels.</p>
              </div>
              <div
                className="card"
                onClick={() => navigate("/pharmacy")}
                style={{ cursor: "pointer" }}
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