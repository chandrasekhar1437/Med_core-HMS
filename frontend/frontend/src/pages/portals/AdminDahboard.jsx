import React from "react";

export default function AdminDashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>⚙️ Admin Command Center</h2>
      <p style={{ color: "#64748b" }}>Manage system settings, staff roles, and financial structures.</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "20px" }}>
        <div style={cardStyle}>
          <h4>Total Staff & Doctors</h4>
          <p style={statStyle}>24 Active</p>
        </div>
        <div style={cardStyle}>
          <h4>Monthly Revenue</h4>
          <p style={statStyle}>$42,850</p>
        </div>
        <div style={cardStyle}>
          <h4>Inventory Health</h4>
          <p style={{ ...statStyle, color: "#16a34a" }}>98% In Stock</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" };
const statStyle = { fontSize: "1.5rem", fontWeight: "bold", margin: "8px 0 0 0", color: "#0284c7" };