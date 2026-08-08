import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Unauthorized() {
  const { user } = useAuth();

  // Determine appropriate dashboard/home redirect based on user role
  const getDashboardPath = () => {
    switch (user?.role?.toLowerCase()) {
      case "patient":
        return "/patient-dashboard";
      case "doctor":
        return "/doctor-dashboard";
      case "receptionist":
        return "/receptionist-dashboard";
      case "admin":
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="center-page">
      <div className="empty-state">
        <div className="empty-icon">!</div>
        <h1>Access Restricted</h1>
        <p>
          Your current role ({user?.role || "Guest"}) does not have permission to open this page.
        </p>

        <Link
          to={getDashboardPath()}
          className="primary-button"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}