import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Main Application Pages
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Prescriptions from "./pages/Prescriptions";
import Billing from "./pages/Billing";
import MedicalRecords from "./pages/MedicalRecords";
import Pharmacy from "./pages/Pharmacy";
import Laboratory from "./pages/Laboratory";
import WardManagement from "./pages/WardManagement";
import Settings from "./pages/Settings";

// Role-Based Dedicated Portals
import AdminDashboard from "./pages/portals/AdminDahboard";
import DoctorDashboard from "./pages/portals/DoctorDashboard";
import NurseDashboard from "./pages/portals/NurseDashboard";
import PatientDashboard from "./pages/portals/PatientDashboard";

import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px", fontSize: "18px", color: "var(--text-muted)" }}>
        Loading session...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px", fontSize: "18px", color: "var(--text-muted)" }}>
        Loading session...
      </div>
    );
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

// Mobile-Responsive App Shell Layout
function MainLayout() {
  return (
    <div className="app-shell-root">
      <Sidebar />
      <main className="app-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  // Synchronize saved dark theme preferences on app initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark-mode");
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/medical-records" element={<MedicalRecords />} />
              <Route path="/pharmacy" element={<Pharmacy />} />
              <Route path="/laboratory" element={<Laboratory />} />
              <Route path="/ward-management" element={<WardManagement />} />
              <Route path="/settings" element={<Settings />} />

              {/* Dedicated Role Portals */}
              <Route path="/portals/admin" element={<AdminDashboard />} />
              <Route path="/portals/doctor" element={<DoctorDashboard />} />
              <Route path="/portals/nurse" element={<NurseDashboard />} />
              <Route path="/portals/patient" element={<PatientDashboard />} />
            </Route>
          </Route>

          {/* Fallback Catch-All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}