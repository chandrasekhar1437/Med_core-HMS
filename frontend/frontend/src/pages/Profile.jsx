import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/apiClient";

export default function Profile() {
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [profileMsg, setProfileMsg] = useState("");
  const [isProfileError, setIsProfileError] = useState(false);

  const [passMsg, setPassMsg] = useState("");
  const [isPassError, setIsPassError] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setIsProfileError(false);
    try {
      const res = await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg("Profile updated successfully!");
      } else {
        setIsProfileError(true);
        setProfileMsg(`Error: ${data.detail || "Failed to update profile."}`);
      }
    } catch (err) {
      setIsProfileError(true);
      setProfileMsg("Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg("");
    setIsPassError(false);
    try {
      const res = await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg("Password changed successfully! Please log in again.");
        setTimeout(() => logout(), 2000);
      } else {
        setIsPassError(true);
        setPassMsg(`Error: ${data.detail || "Failed to change password."}`);
      }
    } catch (err) {
      setIsPassError(true);
      setPassMsg("Failed to change password.");
    }
  };

  return (
    <div className="profile-wrapper">
      <style>{`
        .profile-wrapper {
          max-width: 650px;
          margin: 30px auto;
          padding: 24px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;
        }

        .profile-header {
          color: #1e293b;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
        }

        .section-form {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title {
          margin: 0;
          color: #334155;
          font-size: 18px;
          font-weight: 600;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-field label {
          font-weight: 600;
          color: #475569;
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          box-sizing: border-box;
          background-color: #ffffff;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          border-color: #0284c7;
        }

        .btn-submit {
          padding: 12px 20px;
          background-color: #0284c7;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: background-color 0.2s ease;
          width: fit-content;
        }

        .btn-submit:hover {
          background-color: #0369a1;
        }

        .btn-danger {
          background-color: #dc2626;
        }

        .btn-danger:hover {
          background-color: #b91c1c;
        }

        .alert-banner {
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .alert-success {
          background-color: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .alert-error {
          background-color: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
        }

        .divider {
          margin: 30px 0;
          border: 0;
          border-top: 1px solid #e2e8f0;
        }

        @media (max-width: 640px) {
          .profile-wrapper {
            padding: 16px;
            margin: 10px auto;
          }

          .section-form {
            padding: 16px;
          }

          .btn-submit {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <h2 className="profile-header">Account Settings</h2>

      {/* Profile Form */}
      <form onSubmit={handleUpdateProfile} className="section-form">
        <h3 className="section-title">Update Profile Info</h3>

        {profileMsg && (
          <div className={`alert-banner ${isProfileError ? "alert-error" : "alert-success"}`}>
            {profileMsg}
          </div>
        )}

        <div className="form-field">
          <label>Full Name:</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
          />
        </div>

        <div className="form-field">
          <label>Email Address:</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john@example.com"
          />
        </div>

        <button type="submit" className="btn-submit">
          Save Profile
        </button>
      </form>

      <hr className="divider" />

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="section-form">
        <h3 className="section-title">Change Password</h3>

        {passMsg && (
          <div className={`alert-banner ${isPassError ? "alert-error" : "alert-success"}`}>
            {passMsg}
          </div>
        )}

        <div className="form-field">
          <label>Current Password:</label>
          <input
            type="password"
            className="form-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <div className="form-field">
          <label>New Password:</label>
          <input
            type="password"
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn-submit btn-danger">
          Update Password
        </button>
      </form>
    </div>
  );
}