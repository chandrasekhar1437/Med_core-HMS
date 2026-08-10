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
    <div className="reports-container">
      <style>{`
        .reports-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;
        }

        .reports-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .eyebrow {
          font-size: 12px;
          font-weight: 700;
          color: #0284c7;
          margin: 0 0 4px 0;
          letter-spacing: 0.5px;
        }

        .reports-heading h1 {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .reports-heading p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .btn-download {
          background-color: #0284c7;
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .btn-download:hover {
          background-color: #0369a1;
        }

        .error-alert {
          color: #b45309;
          background-color: #fef3c7;
          border: 1px solid #fde68a;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        /* Metrics Card Grid */
        .stat-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card-item {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 18px;
          display: flex;
          gap: 14px;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .stat-icon-box {
          font-size: 20px;
          background-color: #f1f5f9;
          color: #0284c7;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-card-item p {
          margin: 0 0 4px 0;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .stat-card-item h2 {
          margin: 0 0 2px 0;
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-card-item .positive {
          font-size: 12px;
          color: #16a34a;
          font-weight: 600;
        }

        /* Chart Panel */
        .chart-panel-box {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .chart-header {
          margin-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
        }

        .chart-header h2 {
          font-size: 18px;
          margin: 0 0 4px 0;
          color: #0f172a;
        }

        .chart-header p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }

        /* Responsive Bar Chart */
        .bar-chart-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 220px;
          gap: 12px;
          padding-top: 20px;
          overflow-x: auto;
          box-sizing: border-box;
        }

        .bar-column-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          height: 100%;
          justify-content: flex-end;
          min-width: 28px;
        }

        .bar-graphic {
          width: 100%;
          max-width: 38px;
          background-color: #0284c7;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease, background-color 0.2s ease;
        }

        .bar-graphic:hover {
          background-color: #0369a1;
        }

        .bar-column-item span {
          margin-top: 8px;
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .reports-container {
            padding: 16px;
          }

          .reports-heading {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-download {
            width: 100%;
            text-align: center;
          }

          .stat-grid-layout {
            grid-template-columns: 1fr;
          }

          .chart-panel-box {
            padding: 16px;
          }

          .bar-chart-container {
            height: 180px;
            gap: 8px;
          }
        }
      `}</style>

      <section className="reports-heading">
        <div>
          <p className="eyebrow">SYSTEM REPORTS</p>
          <h1>Hospital Reports</h1>
          <p>Review operational, patient, and financial performance.</p>
        </div>

        <button className="btn-download" onClick={() => window.print()}>
          Download Report
        </button>
      </section>

      {error && <div className="error-alert">{error}</div>}

      <section className="stat-grid-layout">
        {loading ? (
          <p style={{ padding: "16px", color: "#64748b" }}>
            Loading summary statistics...
          </p>
        ) : (
          displayReports.map(([label, value, change]) => (
            <article className="stat-card-item" key={label}>
              <div className="stat-icon-box">▥</div>

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

      <section className="chart-panel-box">
        <div className="chart-header">
          <div>
            <h2>Monthly Performance</h2>
            <p>Hospital activity summary</p>
          </div>
        </div>

        <div className="bar-chart-container">
          {displayMonthly.map((item, index) => (
            <div className="bar-column-item" key={index}>
              <div
                className="bar-graphic"
                style={{
                  height: `${item.height || item.value}%`,
                }}
              />
              <span>{item.month || item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}