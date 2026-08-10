import React from "react";

export default function PatientDashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>👤 Patient Self-Service Portal</h2>
      <p style={{ color: "#64748b" }}>View your appointments, lab results, and active prescriptions.</p>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={boxStyle}>
          <h4>📅 Upcoming Appointments</h4>
          <p>Dr. Smith - Cardiology (Tomorrow at 10:00 AM)</p>
        </div>
        <div style={boxStyle}>
          <h4>💊 Active Prescriptions</h4>
          <p>Amoxicillin - 500mg (Take 1 tablet every 8 hours)</p>
        </div>
      </div>
    </div>
  );
}

const boxStyle = { background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" };