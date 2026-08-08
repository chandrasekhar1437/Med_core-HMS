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
  const [passMsg, setPassMsg] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      const res = await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg("Profile updated successfully!");
      } else {
        setProfileMsg(`Error: ${data.detail}`);
      }
    } catch (err) {
      setProfileMsg("Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg("");
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
        setPassMsg(`Error: ${data.detail}`);
      }
    } catch (err) {
      setPassMsg("Failed to change password.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
      <h2>Account Settings</h2>

      {/* Profile Form */}
      <form onSubmit={handleUpdateProfile} style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3>Update Profile Info</h3>
        {profileMsg && <p>{profileMsg}</p>}
        <div>
          <label>Full Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label>Email Address:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        </div>
        <button type="submit" style={btnStyle}>Save Profile</button>
      </form>

      <hr />

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3>Change Password</h3>
        {passMsg && <p>{passMsg}</p>}
        <div>
          <label>Current Password:</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label>New Password:</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={inputStyle} />
        </div>
        <button type="submit" style={{ ...btnStyle, backgroundColor: "#dc2626" }}>Update Password</button>
      </form>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "0.5rem", marginTop: "0.25rem", borderRadius: "4px", border: "1px solid #ccc" };
const btnStyle = { padding: "0.6rem 1.2rem", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };