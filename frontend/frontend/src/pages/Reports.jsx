import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Reports() {
  const [metrics, setMetrics] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch report analytics from FastAPI backend
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports/summary");
      
      // Expected structure: { metrics: [...], monthlyData: [...] }
      if (response.data) {
        setMetrics(response.data.metrics || null);
        setMonthlyData(response.data.monthlyData || []);
      }
      setError("");
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load real-time analytics. Displaying default report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Default mock data fallbacks
  const defaultReports = [
    ["Patient Registration", "1,248", "+12.5%"],
    ["Completed Appointments", "782", "+9.2%"],
    ["Hospital Revenue", "₹8,45,000", "+15.3%"],
    ["Doctor Utilization", "87%", "+4.1%"],
  ];

  const defaultMonthly = [
    { month: "Jan", height: 55 },
    { month: "Feb", height: 72 },
    { month: "Mar", height: 64 },
    { month: "Apr", height: 88 },
    { month: "May", height: 76 },
    { month: "Jun", height: 95 },
    { month: "Jul", height: 82 },
  ];

  const displayReports = metrics || defaultReports;
  const displayMonthly = monthlyData.length > 0 ? monthlyData : defaultMonthly;

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">SYSTEM REPORTS</p>
          <h1>Hospital Reports</h1>
          <p>Review operational, patient, and financial performance.</p>
        </div>

        <button className="primary-button" onClick={() => window.print()}>
          Download Report
        </button>
      </section>

      {error && (
        <div style={{ color: "orange", padding: "0 2rem 1rem" }}>
          {error}
        </div>
      )}

      <section className="stat-grid">
        {loading ? (
          <p style={{ padding: "1rem" }}>Loading summary statistics...</p>
        ) : (
          displayReports.map(([label, value, change]) => (
            <article className="stat-card" key={label}>
              <div className="stat-icon">▥</div>

              <div>
                <p>{label}</p>
                <h2>{value}</h2>
                <span className="positive">
                  {change} compared with last month
                </span>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="panel report-panel">
        <div className="panel-header">
          <div>
            <h2>Monthly Performance</h2>
            <p>Hospital activity summary</p>
          </div>
        </div>

        <div className="bar-chart">
          {displayMonthly.map((item, index) => (
            <div className="bar-column" key={index}>
              <div
                className="bar"
                style={{
                  height: `${item.height || item.value}%`,
                }}
              />
              <span>{item.month || item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}