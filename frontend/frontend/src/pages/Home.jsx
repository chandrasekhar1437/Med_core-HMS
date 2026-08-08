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
  });
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
        ] = await Promise.all([
          API.get("/patients/").catch(() => ({ data: [] })),
          API.get("/doctors/").catch(() => ({ data: [] })),
          API.get("/appointments/").catch(() => ({ data: [] })),
          API.get("/prescriptions/").catch(() => ({ data: [] })),
          API.get("/billing/").catch(() => ({ data: [] })),
          API.get("/laboratory/").catch(() => ({ data: [] })),
        ]);

        const billingData = Array.isArray(billingRes.data)
          ? billingRes.data
          : billingRes.data?.invoices || [];

        setStats({
          patients: Array.isArray(patientsRes.data) ? patientsRes.data.length : 0,
          doctors: Array.isArray(doctorsRes.data) ? doctorsRes.data.length : 0,
          appointments: Array.isArray(appointmentsRes.data) ? appointmentsRes.data.length : 0,
          prescriptions: Array.isArray(prescriptionsRes.data) ? prescriptionsRes.data.length : 0,
          pendingInvoices: billingData.filter(
            (inv) => inv.status?.toLowerCase() === "pending"
          ).length,
          labTests: Array.isArray(labRes.data) ? labRes.data.length : 0,
        });
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
    { title: "Medical Records", path: "/medical-records", icon: <Activity size={24} color="#dc2626" />, count: "Clinical", desc: "Access clinical diagnoses & treatment histories" },
    { title: "Pharmacy", path: "/pharmacy", icon: <Pill size={24} color="#059669" />, count: "Inventory", desc: "Manage medicine inventory & stock levels" },
    { title: "Laboratory", path: "/laboratory", icon: <FlaskConical size={24} color="#7c3aed" />, count: stats.labTests, desc: "Order diagnostic tests & upload lab results" },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#0f172a", margin: 0 }}>
          Hospital Operations Dashboard
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
          Welcome back! Here is a real-time summary of hospital management records.
        </p>
      </div>

      {loading ? (
        <p style={{ color: "#64748b" }}>Loading dashboard statistics...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {modules.map((m) => (
            <Link
              key={m.title}
              to={m.path}
              style={{
                textDecoration: "none",
                color: "inherit",
                backgroundColor: "#ffffff",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "#f8fafc",
                      borderRadius: "0.375rem",
                    }}
                  >
                    {m.icon}
                  </div>
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#0f172a",
                    }}
                  >
                    {m.count}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    margin: "0 0 0.5rem 0",
                    color: "#1e293b",
                  }}
                >
                  {m.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
                  {m.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}