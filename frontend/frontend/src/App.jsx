import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Prescriptions from "./pages/Prescriptions";
import Billing from "./pages/Billing";
import MedicalRecords from "./pages/MedicalRecords";
import Pharmacy from "./pages/Pharmacy";
import Laboratory from "./pages/Laboratory";
import Settings from "./pages/Settings";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px", fontSize: "18px", color: "#64748b" }}>
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
      <div style={{ textAlign: "center", padding: "50px", fontSize: "18px", color: "#64748b" }}>
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
      <style>{`
        .app-shell-root {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
        }

        .app-main-content {
          margin-left: 250px;
          width: calc(100% - 250px);
          min-height: 100vh;
          box-sizing: border-box;
          transition: margin-left 0.3s ease, width 0.3s ease;
        }

        @media (max-width: 768px) {
          .app-shell-root {
            flex-direction: column;
          }

          .app-main-content {
            margin-left: 0 !important;
            width: 100% !important;
            padding-top: 60px; /* Leave room for fixed mobile top header */
          }
        }
      `}</style>

      <Sidebar />

      <main className="app-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Fallback Catch-All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}