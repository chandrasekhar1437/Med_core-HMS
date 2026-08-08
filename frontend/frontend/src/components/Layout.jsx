import { NavLink, Outlet } from "react-router-dom";

function Layout() {
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "▦" },
    { path: "/patients", label: "Patients", icon: "♙" },
    { path: "/doctors", label: "Doctors", icon: "⚕" },
    { path: "/appointments", label: "Appointments", icon: "◷" },
  ];

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
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="profile">
          <div className="profile-avatar">A</div>

          <div>
            <strong>Administrator</strong>
            <small>System Admin</small>
          </div>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;