import React from "react";
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
      <style>{`
        .center-page {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: #f8fafc;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;
        }

        .empty-state {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 36px 28px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          background-color: #fee2e2;
          color: #dc2626;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          margin: 0 auto 20px auto;
        }

        .empty-state h1 {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 10px 0;
        }

        .empty-state p {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .primary-button {
          display: inline-block;
          background-color: #0284c7;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          transition: background-color 0.2s ease;
          box-sizing: border-box;
        }

        .primary-button:hover {
          background-color: #0369a1;
        }

        @media (max-width: 640px) {
          .center-page {
            padding: 16px;
          }

          .empty-state {
            padding: 28px 20px;
          }

          .primary-button {
            display: block;
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <div className="empty-state">
        <div className="empty-icon">!</div>
        <h1>Access Restricted</h1>
        <p>
          Your current role (<strong>{user?.role || "Guest"}</strong>) does not have permission to open this page.
        </p>

        <Link to={getDashboardPath()} className="primary-button">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}