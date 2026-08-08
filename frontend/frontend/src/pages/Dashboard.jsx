import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>HealthManager</h2>
          <span>{user?.role || "Admin"}</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="active">
            Dashboard
          </Link>
          <Link to="/patients">Patients</Link>
          <Link to="/doctors">Doctors</Link>
          <Link to="/appointments">Appointments</Link>
          <Link to="/prescriptions">Prescriptions</Link>
          <Link to="/billing">Billing</Link>
          <Link to="/medical-records">Medical Records</Link>
          {/* Pharmacy placed before Laboratory */}
          <Link to="/pharmacy">Pharmacy</Link>
          <Link to="/laboratory">Laboratory</Link>
          <button onClick={logout} className="logout-btn">
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name || "User"}!</p>
          </div>
          {/* Quick Action Navigation Button */}
          <button
            className="primary-btn"
            onClick={() => navigate("/appointments")}
          >
            Manage Appointments
          </button>
        </header>

        {/* Quick Navigation Cards */}
        <div className="dashboard-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "20px" }}>
          <div className="card" onClick={() => navigate("/patients")} style={{ cursor: "pointer" }}>
            <h3>Patients</h3>
            <p>View and manage patient records</p>
          </div>
          <div className="card" onClick={() => navigate("/doctors")} style={{ cursor: "pointer" }}>
            <h3>Doctors</h3>
            <p>View available medical staff</p>
          </div>
          <div className="card" onClick={() => navigate("/appointments")} style={{ cursor: "pointer" }}>
            <h3>Appointments</h3>
            <p>Schedule and track bookings</p>
          </div>
          <div className="card" onClick={() => navigate("/medical-records")} style={{ cursor: "pointer" }}>
            <h3>Medical Records</h3>
            <p>Access patient diagnosis files</p>
          </div>
          {/* Pharmacy card placed before Laboratory card */}
          <div className="card" onClick={() => navigate("/pharmacy")} style={{ cursor: "pointer" }}>
            <h3>Pharmacy</h3>
            <p>Manage inventory & stock</p>
          </div>
          <div className="card" onClick={() => navigate("/laboratory")} style={{ cursor: "pointer" }}>
            <h3>Laboratory</h3>
            <p>Manage test reports & orders</p>
          </div>
        </div>
      </main>
    </div>
  );
}