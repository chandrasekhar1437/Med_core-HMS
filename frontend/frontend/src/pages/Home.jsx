import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Calendar,
  FileText,
  DollarSign,
  Activity,
  Pill,
  FlaskConical,
  Stethoscope,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import API from "../services/api";

export default function Home() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    prescriptions: 0,
    pendingInvoices: 0,
    labTests: 0,
    medicalRecords: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const [
          patientsRes,
          doctorsRes,
          appointmentsRes,
          prescriptionsRes,
          billingRes,
          labRes,
          recordsRes,
        ] = await Promise.all([
          API.get("/patients/").catch(() => ({ data: [] })),
          API.get("/doctors/").catch(() => ({ data: [] })),
          API.get("/appointments/").catch(() => ({ data: [] })),
          API.get("/prescriptions/").catch(() => ({ data: [] })),
          API.get("/billing/").catch(() => ({ data: [] })),
          API.get("/laboratory/").catch(() => ({ data: [] })),
          API.get("/medical-records/").catch(() => ({ data: [] })),
        ]);

        const billingData = Array.isArray(billingRes.data)
          ? billingRes.data
          : billingRes.data?.invoices || [];

        const recordsData = Array.isArray(recordsRes.data)
          ? recordsRes.data
          : recordsRes.data?.records || [];

        setStats({
          patients: Array.isArray(patientsRes.data) ? patientsRes.data.length : 0,
          doctors: Array.isArray(doctorsRes.data) ? doctorsRes.data.length : 0,
          appointments: Array.isArray(appointmentsRes.data) ? appointmentsRes.data.length : 0,
          prescriptions: Array.isArray(prescriptionsRes.data) ? prescriptionsRes.data.length : 0,
          pendingInvoices: billingData.filter(
            (inv) => inv.status?.toLowerCase() === "pending"
          ).length,
          labTests: Array.isArray(labRes.data) ? labRes.data.length : 0,
          medicalRecords: recordsData.length,
        });

        // Store up to 5 recent medical records for display
        setRecentRecords(recordsData.slice(0, 5));
      } catch (err) {
        console.error("Error fetching dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const modules = [
    { title: "Patients", path: "/patients", icon: <Users size={24} color="#2563eb" />, count: stats.patients, desc: "Manage patient registrations & records" },
    { title: "Doctors", path: "/doctors", icon: <UserCheck size={24} color="#0284c7" />, count: stats.doctors, desc: "View medical staff profiles & availability" },
    { title: "Appointments", path: "/appointments", icon: <Calendar size={24} color="#16a34a" />, count: stats.appointments, desc: "Schedule and track patient bookings" },
    { title: "Prescriptions", path: "/prescriptions", icon: <FileText size={24} color="#9333ea" />, count: stats.prescriptions, desc: "Issue and monitor electronic prescriptions" },
    { title: "Billing & Invoices", path: "/billing", icon: <DollarSign size={24} color="#d97706" />, count: `${stats.pendingInvoices} Pending`, desc: "Manage invoices, payments & export PDFs" },
    { title: "Medical Records", path: "/medical-records", icon: <Activity size={24} color="#dc2626" />, count: `${stats.medicalRecords} Logs`, desc: "Access clinical diagnoses & treatment histories" },
    { title: "Pharmacy", path: "/pharmacy", icon: <Pill size={24} color="#059669" />, count: "Inventory", desc: "Manage medicine inventory & stock levels" },
    { title: "Laboratory", path: "/laboratory", icon: <FlaskConical size={24} color="#7c3aed" />, count: stats.labTests, desc: "Order diagnostic tests & upload lab results" },
  ];

  return (
    <div className="home-container">
      <style>{`
        .home-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;
        }

        .home-header {
          margin-bottom: 28px;
        }

        .home-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .home-subtitle {
          color: #64748b;
          margin-top: 6px;
          font-size: 15px;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
          margin-bottom: 36px;
        }

        .module-card {
          text-decoration: none;
          color: inherit;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .module-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
          border-color: #38bdf8;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .icon-wrapper {
          padding: 10px;
          background-color: #f8fafc;
          border-radius: 8px;
        }

        .count-badge {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .card-title {
          font-size: 17px;
          font-weight: 600;
          margin: 0 0 6px 0;
          color: #1e293b;
        }

        .card-desc {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }

        /* Medical Details Section */
        .medical-section {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .section-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 18px 0;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 12px;
        }

        .medical-metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .metric-box h4 {
          margin: 0 0 2px 0;
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }

        .metric-box p {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }

        /* Desktop Records Table */
        .records-table-container {
          overflow-x: auto;
        }

        .records-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          text-align: left;
        }

        .records-table th {
          background-color: #f1f5f9;
          color: #475569;
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          font-weight: 600;
        }

        .records-table td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }

        /* Mobile Cards List for Medical Activity */
        .mobile-records-list {
          display: none;
          flex-direction: column;
          gap: 12px;
        }

        .record-card-mobile {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px;
        }

        .record-card-mobile-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .record-card-mobile-body {
          font-size: 13px;
          color: #475569;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .diagnosis-tag {
          display: inline-block;
          background-color: #fee2e2;
          color: #991b1b;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .home-container {
            padding: 16px;
          }

          .home-title {
            font-size: 22px;
          }

          .modules-grid {
            grid-template-columns: 1fr;
          }

          .records-table-container {
            display: none;
          }

          .mobile-records-list {
            display: flex;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="home-header">
        <h1 className="home-title">Hospital Operations Dashboard</h1>
        <p className="home-subtitle">
          Welcome back! Real-time summary of hospital management records & clinical activity.
        </p>
      </div>

      {loading ? (
        <p style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>
          Loading dashboard statistics...
        </p>
      ) : (
        <>
          {/* Main Operations Grid */}
          <div className="modules-grid">
            {modules.map((m) => (
              <Link key={m.title} to={m.path} className="module-card">
                <div>
                  <div className="card-top">
                    <div className="icon-wrapper">{m.icon}</div>
                    <span className="count-badge">{m.count}</span>
                  </div>
                  <h3 className="card-title">{m.title}</h3>
                  <p className="card-desc">{m.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Medical Details & Clinical Activity Section */}
          <div className="medical-section">
            <h2 className="section-header-title">
              <Stethoscope size={24} color="#dc2626" />
              Medical Records & Clinical Summary
            </h2>

            {/* Clinical Overview Metric Boxes */}
            <div className="medical-metrics-row">
              <div className="metric-box">
                <ClipboardList size={28} color="#2563eb" />
                <div>
                  <h4>Total Diagnoses logged</h4>
                  <p>{stats.medicalRecords}</p>
                </div>
              </div>

              <div className="metric-box">
                <FlaskConical size={28} color="#7c3aed" />
                <div>
                  <h4>Lab Orders Active</h4>
                  <p>{stats.labTests}</p>
                </div>
              </div>

              <div className="metric-box">
                <AlertTriangle size={28} color="#dc2626" />
                <div>
                  <h4>Critical Watchlist</h4>
                  <p>
                    {recentRecords.filter(
                      (r) =>
                        r.diagnosis?.toLowerCase().includes("fever") ||
                        r.diagnosis?.toLowerCase().includes("acute") ||
                        r.status?.toLowerCase() === "critical"
                    ).length || "None"}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Medical Activity Listing */}
            <h3 style={{ fontSize: "16px", color: "#334155", marginBottom: "12px" }}>
              Recent Patient Diagnoses & Medical Logs
            </h3>

            {recentRecords.length === 0 ? (
              <p style={{ color: "#64748b", fontStyle: "italic", margin: 0 }}>
                No recent clinical records available. Click 'Medical Records' to record patient history.
              </p>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="records-table-container">
                  <table className="records-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Diagnosis</th>
                        <th>Treatment Plan</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRecords.map((rec) => (
                        <tr key={rec.id || rec._id}>
                          <td><strong>{rec.patient_name || rec.patient || "Patient"}</strong></td>
                          <td>{rec.doctor_name || rec.doctor || "Physician"}</td>
                          <td>
                            <span className="diagnosis-tag">
                              {rec.diagnosis || "General Checkup"}
                            </span>
                          </td>
                          <td>{rec.treatment || rec.treatment_plan || "Observational Care"}</td>
                          <td style={{ color: "#64748b" }}>
                            {rec.date || rec.created_at?.slice(0, 10) || "Today"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="mobile-records-list">
                  {recentRecords.map((rec) => (
                    <div key={rec.id || rec._id} className="record-card-mobile">
                      <div className="record-card-mobile-header">
                        <span>{rec.patient_name || rec.patient || "Patient"}</span>
                        <span className="diagnosis-tag">
                          {rec.diagnosis || "General"}
                        </span>
                      </div>
                      <div className="record-card-mobile-body">
                        <div><strong>Attending:</strong> {rec.doctor_name || rec.doctor || "Doctor"}</div>
                        <div><strong>Treatment:</strong> {rec.treatment || rec.treatment_plan || "Care Plan"}</div>
                        <div><strong>Date:</strong> {rec.date || rec.created_at?.slice(0, 10) || "Today"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}