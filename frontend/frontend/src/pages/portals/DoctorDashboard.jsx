import React from "react";

export default function DoctorDashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>🩺 Doctor Workspace</h2>
      <p style={{ color: "#64748b" }}>Daily appointment queue and patient EHR access.</p>

      <div style={{ marginTop: "20px", background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <h3>Today's Patient Queue (5 Pending)</h3>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "12px" }}>
          <li style={itemStyle}>
            <strong>John Doe</strong> - Fever & Cough (Slot: 10:30 AM)
            <button style={btnStyle}>Write Prescription</button>
          </li>
          <li style={itemStyle}>
            <strong>Jane Smith</strong> - Follow-up Checkup (Slot: 11:15 AM)
            <button style={btnStyle}>Write Prescription</button>
          </li>
        </ul>
      </div>
    </div>
  );
}

const itemStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" };
const btnStyle = { backgroundColor: "#0284c7", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" };