import React from "react";

export default function NurseDashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>🏥 Nurse & Front-Desk Operations</h2>
      <p style={{ color: "#64748b" }}>Manage walk-ins, bed allocation, and vital sign logs.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "20px" }}>
        <div style={cardStyle}>
          <h4>Bed Allocation Status</h4>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0284c7" }}>18 / 25 Beds Occupied</p>
        </div>
        <div style={cardStyle}>
          <h4>Pending Vital Records</h4>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#ca8a04" }}>4 Walk-ins Waiting</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" };