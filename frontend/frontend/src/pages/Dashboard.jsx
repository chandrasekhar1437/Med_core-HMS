import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Normalize user role string
  const role = (user?.role || "Patient").toLowerCase();

  const [stats, setStats] = useState({
    patientsCount: 0,
    appointmentsCount: 0,
    prescriptionsCount: 0,
    labOrdersCount: 0,
  });

  // Fetch quick metrics counters for dashboard summary
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const [pRes, aRes, rxRes, labRes] = await Promise.allSettled([
          API.get("/patients/"),
          API.get("/appointments/"),
          API.get("/prescriptions/"),
          API.get("/laboratory/"),
        ]);

        setStats({
          patientsCount: pRes.status === "fulfilled" && Array.isArray(pRes.value.data) ? pRes.value.data.length : 0,
          appointmentsCount: aRes.status === "fulfilled" && Array.isArray(aRes.value.data) ? aRes.value.data.length : 0,
          prescriptionsCount: rxRes.status === "fulfilled" && Array.isArray(rxRes.value.data) ? rxRes.value.data.length : 0,
          labOrdersCount: labRes.status === "fulfilled" && Array.isArray(labRes.value.data) ? labRes.value.data.length : 0,
        });
      } catch (err) {
        console.error("Dashboard metrics load error:", err);
      }
    };

    fetchDashboardMetrics();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>
            Dashboard
            <span className="role-badge-tag">{user?.role || "Patient"}</span>
          </h1>
          <p>Welcome back, {user?.name || user?.email || "User"}!</p>
        </div>

        {/* Primary Action Button tailored to user role */}
        <button
          className="primary-action-btn"
          onClick={() => {
            if (role === "patient") navigate("/appointments");
            else if (role === "doctor") navigate("/prescriptions");
            else if (role === "nurse") navigate("/medical-records");
            else navigate("/patients");
          }}
        >
          {role === "patient" && "Book Appointment"}
          {role === "doctor" && "Issue E-Prescription"}
          {role === "nurse" && "Log Patient Vitals"}
          {(role === "admin" || role === "staff") && "+ New Patient Intake"}
        </button>
      </header>

      {/* Quick Metrics Summary Bar */}
      <div className="metrics-summary-grid">
        <div className="metric-card">
          <div className="metric-label">Registered Patients</div>
          <div className="metric-value">{stats.patientsCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Scheduled Visits</div>
          <div className="metric-value">{stats.appointmentsCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active Prescriptions</div>
          <div className="metric-value">{stats.prescriptionsCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pending Lab Tests</div>
          <div className="metric-value">{stats.labOrdersCount}</div>
        </div>
      </div>

      <h2 className="dashboard-section-title">Quick Actions & Portal Features</h2>

      {/* Dynamic Action Cards Grid */}
      <div className="dashboard-action-cards">
        {/* 1. PATIENT FOCUS */}
        {role === "patient" && (
          <>
            <div className="feature-card" onClick={() => navigate("/medical-records")}>
              <div>
                <h3>Health Records</h3>
                <p>Access your medical diagnosis files, lab reports, and clinical history.</p>
              </div>
              <span className="card-action-link">View Health Records →</span>
            </div>
            <div className="feature-card" onClick={() => navigate("/appointments")}>
              <div>
                <h3>My Appointments</h3>
                <p>Schedule new consultations and track upcoming clinic visits.</p>
              </div>
              <span className="card-action-link">Manage Appointments →</span>
            </div>
            <div className="feature-card" onClick={() => navigate("/prescriptions")}>
              <div>
                <h3>E-Prescriptions</h3>
                <p>View active medications, dosage instructions, and refill logs.</p>
              </div>
              <span className="card-action-link">Check Prescriptions →</span>
            </div>
          </>
        )}

        {/* 2. DOCTOR FOCUS */}
        {role === "doctor" && (
          <>
            <div className="feature-card" onClick={() => navigate("/appointments")}>
              <div>
                <h3>My Schedule</h3>
                <p>View upcoming patient visits, time slots, and consultation reasons.</p>
              </div>
              <span className="card-action-link">Open Schedule →</span>
            </div>
            <div className="feature-card" onClick={() => navigate("/patients")}>
              <div>
                <h3>Patient Roster</h3>
                <p>Browse assigned patient medical histories and active profiles.</p>
              </div>
              <span className="card-action-link">View Patients →</span>
            </div>
            <div className="feature-card" onClick={() => navigate("/prescriptions")}>
              <div>
                <h3>Issue Prescriptions</h3>
                <p>Record clinical progress notes and write electronic prescriptions.</p>
              </div>
              <span className="card-action-link">Write E-Prescription →</span>
            </div>
          </>
        )}

        {/* 3. ADMINISTRATIVE STAFF & ADMIN FOCUS */}
        {(role === "admin" || role === "staff") && (
          <>
            <div className="feature-card" onClick={() => navigate("/billing")}>
              <div>
                <h3>Billing & Invoices</h3>
                <p>Process patient payments, insurance claims, and pending invoices.</p>
              </div>
              <span className="card-action-link">Open Billing Portal →</span>
            </div>
            <div className="feature-card" onClick={() => navigate("/appointments")}>
              <div>
                <h3>Appointment Scheduling</h3>
                <p>Manage clinic time slots, assign doctors, and track bookings.</p>
              </div>
              <span className="card-action-link">Manage Calendar →</span>
            </div>
            <div className="feature-card" onClick={() => navigate("/patients")}>
              <div>
                <h3>Patient Registration</h3>
                <p>Register new patient profiles and update personal intake records.</p>
              </div>
              <span className="card-action-link">Register Patient →</span>
            </div>
            <div className="feature-card" onClick={() => navigate("/pharmacy")}>
              <div>
                <h3>Pharmacy Inventory</h3>
                <p>Monitor drug stock levels, reorder alerts, and prices.</p>
              </div>
              <span className="card-action-link">Check Stock →</span>
            </div>
          </>
        )}

        {/* 4. NURSE FOCUS */}
        {role === "nurse" && (
          <>
            <div className="feature-card" onClick={() => navigate("/patients")}>
              <div>
                <h3>Assigned Tasks</h3>
                <p>Track daily ward duties, care plans, and patient intake requests.</p>
              </div>
              <span className="card-action-link">View Task List →</span>
            </div>
            <div className="feature-card" onClick={() => navigate("/medical-records")}>
              <div>
                <h3>Vital Signs Tracking</h3>
                <p>Record blood pressure, pulse, temperature, and oxygen levels.</p>
              </div>
              <span className="card-action-link">Log Patient Vitals →</span>
            </div>
            <div className="feature-card" onClick={() => navigate("/pharmacy")}>
              <div>
                <h3>Medication Schedules</h3>
                <p>Monitor medicine dosage timetables and log administered meds.</p>
              </div>
              <span className="card-action-link">Check Medicines →</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}