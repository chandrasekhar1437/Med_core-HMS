import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuByRole = {
  Administrator: [
    ["Dashboard", "/dashboard", "▦"],
    ["Patients", "/patients", "♙"],
    ["Appointments", "/appointments", "◷"],
    ["Doctors", "/schedule", "⚕"],
    ["Medical Records", "/medical-records", "▤"],
    ["Prescriptions", "/prescriptions", "✚"],
    ["Billing", "/billing", "₹"],
    ["Reports", "/reports", "▥"],
  ],
  Doctor: [
    ["Dashboard", "/dashboard", "▦"],
    ["Appointments", "/appointments", "◷"],
    ["My Schedule", "/schedule", "◴"],
    ["Medical Records", "/medical-records", "▤"],
    ["Prescriptions", "/prescriptions", "✚"],
  ],
  Receptionist: [
    ["Dashboard", "/dashboard", "▦"],
    ["Patients", "/patients", "♙"],
    ["Appointments", "/appointments", "◷"],
    ["Billing", "/billing", "₹"],
  ],
  Patient: [
    ["Dashboard", "/dashboard", "▦"],
    ["Appointments", "/appointments", "◷"],
    ["Medical Records", "/medical-records", "▤"],
    ["Prescriptions", "/prescriptions", "✚"],
    ["Billing", "/billing", "₹"],
  ],
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const menu = menuByRole[user.role] || [];

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/dashboard" className="brand">
          <span className="brand-icon">✚</span>

          <span>
            <strong>HealthManager</strong>
            <small>Healthcare Management</small>
          </span>
        </NavLink>

        <nav className="navigation">
          {menu.map(([label, path, icon]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="user-area">
          <div className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="user-text">
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>

          <button
            className="logout-button"
            onClick={logout}
            title="Log out"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}