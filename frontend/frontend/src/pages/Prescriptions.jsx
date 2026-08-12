import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Prescriptions.css";

export default function Prescriptions() {
  const { user } = useAuth();
  const role = (user?.role || "patient").toLowerCase();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [form, setForm] = useState({
    patient: "",
    doctor_name: "",
    medicine: "",
    dosage: "",
    frequency: "Twice daily",
    duration: "",
    instructions: "",
    status: "Active",
  });

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/prescriptions/");
      setPrescriptions(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to load prescriptions from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Pre-fill doctor or patient fields dynamically based on active role
  useEffect(() => {
    if (role === "doctor" && user?.name && !form.doctor_name) {
      setForm((prev) => ({ ...prev, doctor_name: user.name }));
    } else if (role === "patient" && user?.name && !form.patient) {
      setForm((prev) => ({ ...prev, patient: user.name }));
    }
  }, [role, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        try {
          await api.patch(`/prescriptions/${editingId}`, form);
        } catch {
          await api.put(`/prescriptions/${editingId}`, form);
        }
      } else {
        await api.post("/prescriptions/", form);
      }

      setForm({
        patient: role === "patient" ? user?.name || "" : "",
        doctor_name: role === "doctor" ? user?.name || "" : "",
        medicine: "",
        dosage: "",
        frequency: "Twice daily",
        duration: "",
        instructions: "",
        status: "Active",
      });
      setEditingId(null);
      fetchPrescriptions();
    } catch (err) {
      console.error("Error saving prescription:", err);
      setError("Failed to save e-prescription record.");
    }
  };

  const handleEdit = (item) => {
    const targetId = item.id || item._id;
    setEditingId(targetId);
    setForm({
      patient: item.patient || item.patient_name || item.patient_id || "",
      doctor_name: item.doctor_name || "",
      medicine: item.medicine || item.medication || "",
      dosage: item.dosage || "",
      frequency: item.frequency || "Twice daily",
      duration: item.duration || "",
      instructions: item.instructions || item.notes || "",
      status: item.status || "Active",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      patient: role === "patient" ? user?.name || "" : "",
      doctor_name: role === "doctor" ? user?.name || "" : "",
      medicine: "",
      dosage: "",
      frequency: "Twice daily",
      duration: "",
      instructions: "",
      status: "Active",
    });
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError("Cannot delete prescription: ID is missing.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this e-prescription?")) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      fetchPrescriptions();
    } catch (err) {
      console.error("Error deleting prescription:", err);
      setError("Failed to delete prescription.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Fulfilled":
        return <span className="rx-badge rx-badge-fulfilled">Fulfilled</span>;
      case "Cancelled":
        return <span className="rx-badge rx-badge-cancelled">Cancelled</span>;
      default:
        return <span className="rx-badge rx-badge-active">Active</span>;
    }
  };

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const pName = rx.patient || rx.patient_name || rx.patient_id || "";
    const med = rx.medicine || rx.medication || "";
    const doc = rx.doctor_name || "";

    const matchesSearch =
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || rx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading && prescriptions.length === 0)
    return <div className="rx-loading">Loading e-prescriptions...</div>;

  return (
    <div className="prescriptions-container">
      <h2 className="rx-header-title">E-Prescription & Dosage Management</h2>

      {error && <div className="rx-error-banner">{error}</div>}

      {/* Prescription Writing Workflow — Restricted for Doctors, Staff, and Admins */}
      {role !== "patient" && (
        <form onSubmit={handleSubmit} className="rx-form-card">
          <h3 className="rx-form-title">
            {editingId ? "Edit E-Prescription" : "Issue New E-Prescription"}
          </h3>

          <div className="rx-form-grid">
            <div className="rx-input-group">
              <label className="rx-label">Patient Name / ID:</label>
              <input
                type="text"
                value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}
                placeholder="e.g. PAT-101 or John Doe"
                required
                className="rx-input"
              />
            </div>

            <div className="rx-input-group">
              <label className="rx-label">Prescribing Doctor:</label>
              <input
                type="text"
                value={form.doctor_name}
                onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
                placeholder="e.g. Dr. Sarah Smith"
                required
                className="rx-input"
              />
            </div>

            <div className="rx-input-group">
              <label className="rx-label">Medication Name:</label>
              <input
                type="text"
                value={form.medicine}
                onChange={(e) => setForm({ ...form, medicine: e.target.value })}
                placeholder="e.g. Amoxicillin 500mg"
                required
                className="rx-input"
              />
            </div>

            <div className="rx-input-group">
              <label className="rx-label">Dosage:</label>
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="e.g. 1 Tablet / 5ml"
                required
                className="rx-input"
              />
            </div>

            <div className="rx-input-group">
              <label className="rx-label">Frequency:</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="rx-select"
              >
                <option value="Once daily">Once daily (QD)</option>
                <option value="Twice daily">Twice daily (BID)</option>
                <option value="Three times daily">Three times daily (TID)</option>
                <option value="Four times daily">Four times daily (QID)</option>
                <option value="As needed">As needed (PRN)</option>
              </select>
            </div>

            <div className="rx-input-group">
              <label className="rx-label">Duration:</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 7 Days / 2 Weeks"
                className="rx-input"
              />
            </div>

            <div className="rx-input-group">
              <label className="rx-label">Rx Status:</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="rx-select"
              >
                <option value="Active">Active</option>
                <option value="Fulfilled">Fulfilled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="rx-input-group full-width">
              <label className="rx-label">Instructions / Remarks:</label>
              <textarea
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="e.g. Take after meals with plenty of water"
                className="rx-textarea"
              />
            </div>
          </div>

          <div className="rx-btn-group">
            <button type="submit" className="rx-btn-primary">
              {editingId ? "Update Prescription" : "Issue Prescription"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rx-btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Prescription List Section */}
      <h3 className="rx-sub-header">Active & Historical Prescriptions</h3>

      <div className="rx-filter-bar">
        <input
          type="text"
          className="rx-search-input"
          placeholder="Filter by patient, medicine, or doctor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="rx-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Fulfilled">Fulfilled</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {filteredPrescriptions.length === 0 ? (
        <p className="rx-no-data">No e-prescriptions found matching your criteria.</p>
      ) : (
        <>
          {/* Desktop View Table */}
          <div className="desktop-table-wrapper">
            <table className="rx-table">
              <thead>
                <tr className="rx-table-header-row">
                  <th>Patient</th>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  {role !== "patient" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((item, index) => {
                  const itemId = item.id || item._id;
                  const pName = item.patient || item.patient_name || item.patient_id || "—";
                  const med = item.medicine || item.medication || "—";
                  return (
                    <tr
                      key={itemId}
                      className={index % 2 === 0 ? "rx-tr-even" : "rx-tr-odd"}
                    >
                      <td>
                        <strong>{pName}</strong>
                      </td>
                      <td>{med}</td>
                      <td>{item.dosage || "—"}</td>
                      <td>{item.frequency || "Twice daily"}</td>
                      <td>{item.duration || "—"}</td>
                      <td>{item.doctor_name || "—"}</td>
                      <td>{getStatusBadge(item.status)}</td>
                      {role !== "patient" && (
                        <td>
                          <button
                            onClick={() => handleEdit(item)}
                            className="rx-btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(itemId)}
                            className="rx-btn-delete"
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
          <div className="mobile-rx-list">
            {filteredPrescriptions.map((item) => {
              const itemId = item.id || item._id;
              const pName = item.patient || item.patient_name || item.patient_id || "—";
              const med = item.medicine || item.medication || "—";
              return (
                <div key={itemId} className="mobile-rx-card">
                  <div className="mobile-rx-header">
                    <span className="mobile-rx-patient">{med}</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="mobile-rx-body">
                    <div>
                      <strong>Patient:</strong> {pName}
                    </div>
                    <div>
                      <strong>Dosage:</strong> {item.dosage || "—"}
                    </div>
                    <div>
                      <strong>Frequency:</strong> {item.frequency || "Twice daily"}
                    </div>
                    <div>
                      <strong>Duration:</strong> {item.duration || "—"}
                    </div>
                    <div>
                      <strong>Doctor:</strong> {item.doctor_name || "—"}
                    </div>
                    {item.instructions && (
                      <div>
                        <strong>Instructions:</strong> {item.instructions}
                      </div>
                    )}
                  </div>
                  {role !== "patient" && (
                    <div className="mobile-rx-actions">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rx-btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(itemId)}
                        className="rx-btn-delete"
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