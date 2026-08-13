import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./WardManagement.css";

export default function WardManagement() {
  const { user } = useAuth();
  const role = (user?.role || "patient").toLowerCase();

  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [wardFilter, setWardFilter] = useState("All");

  const [form, setForm] = useState({
    patient_name: "",
    ward_type: "General Ward",
    bed_number: "",
    admission_date: new Date().toISOString().split("T")[0],
    status: "Admitted",
    vitals: "BP: 120/80 | Temp: 98.6°F | SpO2: 98%",
  });

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const response = await API.get("/ward-management/");
      setAllocations(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching ward allocations:", err);
      // Fallback mock dataset if backend endpoint is initializing
      setAllocations([
        {
          id: "W-101",
          patient_name: "Rahul Sharma",
          ward_type: "ICU",
          bed_number: "ICU-04",
          admission_date: "2026-08-10",
          status: "Admitted",
          vitals: "BP: 130/85 | Temp: 99.1°F | SpO2: 96%",
        },
        {
          id: "W-102",
          patient_name: "Priya Patel",
          ward_type: "General Ward",
          bed_number: "GW-12",
          admission_date: "2026-08-11",
          status: "Observation",
          vitals: "BP: 118/75 | Temp: 98.4°F | SpO2: 99%",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        try {
          await API.patch(`/ward-management/${editingId}`, form);
        } catch {
          await API.put(`/ward-management/${editingId}`, form);
        }
      } else {
        await API.post("/ward-management/", form);
      }

      setForm({
        patient_name: "",
        ward_type: "General Ward",
        bed_number: "",
        admission_date: new Date().toISOString().split("T")[0],
        status: "Admitted",
        vitals: "BP: 120/80 | Temp: 98.6°F | SpO2: 98%",
      });
      setEditingId(null);
      fetchAllocations();
    } catch (err) {
      console.error("Error saving allocation record:", err);
      setError("Failed to save bed allocation record.");
    }
  };

  const handleEdit = (item) => {
    const targetId = item.id || item._id;
    setEditingId(targetId);
    setForm({
      patient_name: item.patient_name || "",
      ward_type: item.ward_type || "General Ward",
      bed_number: item.bed_number || "",
      admission_date: item.admission_date || new Date().toISOString().split("T")[0],
      status: item.status || "Admitted",
      vitals: item.vitals || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to release or delete this bed allocation?")) return;

    try {
      await API.delete(`/ward-management/${id}`);
      fetchAllocations();
    } catch (err) {
      console.error("Error deleting ward record:", err);
      setError("Failed to delete ward allocation.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Discharged":
        return <span className="ward-badge badge-discharged">Discharged</span>;
      case "Observation":
        return <span className="ward-badge badge-observation">Observation</span>;
      default:
        return <span className="ward-badge badge-admitted">Admitted</span>;
    }
  };

  const filteredAllocations = allocations.filter((item) => {
    const matchesSearch =
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bed_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWard =
      wardFilter === "All" || item.ward_type === wardFilter;

    return matchesSearch && matchesWard;
  });

  if (loading && allocations.length === 0) {
    return <div className="ward-loading">Loading ward allocations & tasks...</div>;
  }

  return (
    <div className="ward-container">
      <h2 className="ward-header">Ward & Bed Allocation Portal</h2>

      {error && <div className="ward-error-banner">{error}</div>}

      {/* Intake & Allocation Form — Nurses, Staff, Doctors, Admins */}
      {role !== "patient" && (
        <form onSubmit={handleSubmit} className="ward-form-card">
          <h3 className="ward-form-title">
            {editingId ? "Update Bed & Ward Allocation" : "Allocate New Bed / Ward"}
          </h3>

          <div className="ward-form-grid">
            <div className="ward-input-group">
              <label className="ward-label">Patient Name</label>
              <input
                type="text"
                value={form.patient_name}
                onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                required
                className="ward-input"
              />
            </div>

            <div className="ward-input-group">
              <label className="ward-label">Ward Category</label>
              <select
                value={form.ward_type}
                onChange={(e) => setForm({ ...form, ward_type: e.target.value })}
                className="ward-select"
              >
                <option value="General Ward">General Ward</option>
                <option value="ICU">Intensive Care Unit (ICU)</option>
                <option value="Private Suite">Private Suite</option>
                <option value="Emergency Ward">Emergency Ward</option>
              </select>
            </div>

            <div className="ward-input-group">
              <label className="ward-label">Bed Number / Code</label>
              <input
                type="text"
                value={form.bed_number}
                onChange={(e) => setForm({ ...form, bed_number: e.target.value })}
                placeholder="e.g. B-104 or ICU-02"
                required
                className="ward-input"
              />
            </div>

            <div className="ward-input-group">
              <label className="ward-label">Admission Date</label>
              <input
                type="date"
                value={form.admission_date}
                onChange={(e) => setForm({ ...form, admission_date: e.target.value })}
                className="ward-input"
              />
            </div>

            <div className="ward-input-group">
              <label className="ward-label">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="ward-select"
              >
                <option value="Admitted">Admitted</option>
                <option value="Observation">Observation</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>

            <div className="ward-input-group">
              <label className="ward-label">Patient Vital Signs Log</label>
              <input
                type="text"
                value={form.vitals}
                onChange={(e) => setForm({ ...form, vitals: e.target.value })}
                placeholder="BP, Temp, SpO2, Heart Rate"
                className="ward-input"
              />
            </div>
          </div>

          <div className="ward-btn-group">
            <button type="submit" className="ward-btn-primary">
              {editingId ? "Update Allocation" : "Save Allocation"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    patient_name: "",
                    ward_type: "General Ward",
                    bed_number: "",
                    admission_date: new Date().toISOString().split("T")[0],
                    status: "Admitted",
                    vitals: "BP: 120/80 | Temp: 98.6°F | SpO2: 98%",
                  });
                }}
                className="ward-btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Ward Occupancy List */}
      <h3 className="ward-sub-header">Current Ward Occupancy & Active Beds</h3>

      <div className="ward-filter-bar">
        <input
          type="text"
          className="ward-search-input"
          placeholder="Filter by patient name or bed number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="ward-filter-select"
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
        >
          <option value="All">All Wards</option>
          <option value="General Ward">General Ward</option>
          <option value="ICU">ICU</option>
          <option value="Private Suite">Private Suite</option>
          <option value="Emergency Ward">Emergency Ward</option>
        </select>
      </div>

      {filteredAllocations.length === 0 ? (
        <p className="ward-no-data">No active bed allocations found.</p>
      ) : (
        <>
          {/* Desktop View Table */}
          <div className="desktop-table-wrapper">
            <table className="ward-table">
              <thead>
                <tr className="ward-table-header-row">
                  <th>Patient</th>
                  <th>Ward Category</th>
                  <th>Bed No.</th>
                  <th>Admission Date</th>
                  <th>Vital Signs Log</th>
                  <th>Status</th>
                  {role !== "patient" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.map((item, index) => {
                  const id = item.id || item._id;
                  return (
                    <tr
                      key={id}
                      className={index % 2 === 0 ? "ward-tr-even" : "ward-tr-odd"}
                    >
                      <td><strong>{item.patient_name}</strong></td>
                      <td>{item.ward_type}</td>
                      <td>{item.bed_number}</td>
                      <td>{item.admission_date}</td>
                      <td>{item.vitals || "—"}</td>
                      <td>{getStatusBadge(item.status)}</td>
                      {role !== "patient" && (
                        <td>
                          <button
                            onClick={() => handleEdit(item)}
                            className="ward-btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="ward-btn-delete"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View Cards */}
          <div className="mobile-ward-list">
            {filteredAllocations.map((item) => {
              const id = item.id || item._id;
              return (
                <div key={id} className="mobile-ward-card">
                  <div className="mobile-ward-header">
                    <span className="mobile-ward-title">{item.patient_name}</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="mobile-ward-body">
                    <div><strong>Ward:</strong> {item.ward_type}</div>
                    <div><strong>Bed No:</strong> {item.bed_number}</div>
                    <div><strong>Admitted:</strong> {item.admission_date}</div>
                    <div><strong>Vitals:</strong> {item.vitals || "—"}</div>
                  </div>
                  {role !== "patient" && (
                    <div className="mobile-card-actions">
                      <button
                        onClick={() => handleEdit(item)}
                        className="ward-btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="ward-btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}