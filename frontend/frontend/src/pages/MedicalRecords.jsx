import React, { useState, useEffect } from "react";
import API from "../services/api";
import "./MedicalRecords.css";

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    patient_id: "",
    diagnosis: "",
    prescription: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await API.get("/medical-records/");
      setRecords(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching medical records:", err);
      setError("Failed to fetch medical records from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.patch(`/medical-records/${editingId}`, form);
        setEditingId(null);
      } else {
        await API.post("/medical-records/", form);
      }
      setForm({ patient_id: "", diagnosis: "", prescription: "", notes: "" });
      fetchRecords();
    } catch (err) {
      console.error("Error saving medical record:", err);
      setError("Failed to save medical record.");
    }
  };

  const handleEditClick = (record) => {
    setEditingId(record.id || record._id);
    setForm({
      patient_id: record.patient_id || "",
      diagnosis: record.diagnosis || "",
      prescription: record.prescription || "",
      notes: record.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ patient_id: "", diagnosis: "", prescription: "", notes: "" });
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError("Cannot delete record: ID is missing.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await API.delete(`/medical-records/${id}`);
      fetchRecords();
    } catch (err) {
      console.error("Error deleting record:", err);
      setError("Failed to delete medical record.");
    }
  };

  if (loading && records.length === 0) {
    return <div className="med-loading">Loading medical records...</div>;
  }

  return (
    <div className="med-records-container">
      <h2 className="med-header-title">Medical Records Management</h2>

      {error && <div className="med-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="med-form-card">
        <h3 className="med-form-title">
          {editingId ? "Edit Medical Record" : "Add Medical Record"}
        </h3>

        <div className="med-form-grid">
          <div className="med-input-group">
            <label className="med-label">Patient ID / Name:</label>
            <input
              type="text"
              name="patient_id"
              placeholder="e.g. PAT-101"
              value={form.patient_id || ""}
              onChange={handleInputChange}
              required
              className="med-input"
            />
          </div>

          <div className="med-input-group">
            <label className="med-label">Diagnosis:</label>
            <input
              type="text"
              name="diagnosis"
              placeholder="Primary Diagnosis"
              value={form.diagnosis || ""}
              onChange={handleInputChange}
              required
              className="med-input"
            />
          </div>
        </div>

        <div className="med-form-grid">
          <div className="med-input-group">
            <label className="med-label">Prescription:</label>
            <input
              type="text"
              name="prescription"
              placeholder="Prescription details"
              value={form.prescription || ""}
              onChange={handleInputChange}
              className="med-input"
            />
          </div>

          <div className="med-input-group">
            <label className="med-label">Clinical Notes:</label>
            <input
              type="text"
              name="notes"
              placeholder="Additional remarks"
              value={form.notes || ""}
              onChange={handleInputChange}
              className="med-input"
            />
          </div>
        </div>

        <div className="med-btn-group">
          <button type="submit" className="med-btn-primary">
            {editingId ? "Update Record" : "Add Record"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="med-btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="med-sub-header">Existing Clinical Records</h3>

      {records.length === 0 ? (
        <p className="med-no-data">No medical records found.</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-table-wrapper">
            <table className="med-table">
              <thead>
                <tr className="med-table-header-row">
                  <th>Patient ID</th>
                  <th>Diagnosis</th>
                  <th>Prescription</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => {
                  const recordId = record.id || record._id;
                  return (
                    <tr
                      key={recordId}
                      className={index % 2 === 0 ? "med-tr-even" : "med-tr-odd"}
                    >
                      <td>
                        <strong>{record.patient_id}</strong>
                      </td>
                      <td>{record.diagnosis}</td>
                      <td>{record.prescription || "—"}</td>
                      <td>{record.notes || "—"}</td>
                      <td>
                        <button
                          onClick={() => handleEditClick(record)}
                          className="med-btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(recordId)}
                          className="med-btn-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-records-list">
            {records.map((record) => {
              const recordId = record.id || record._id;
              return (
                <div key={recordId} className="mobile-record-card">
                  <div className="mobile-card-header">
                    <span className="mobile-patient-id">
                      {record.patient_id}
                    </span>
                  </div>
                  <div className="mobile-card-body">
                    <div>
                      <strong>Diagnosis:</strong> {record.diagnosis}
                    </div>
                    <div>
                      <strong>Prescription:</strong> {record.prescription || "—"}
                    </div>
                    <div>
                      <strong>Notes:</strong> {record.notes || "—"}
                    </div>
                  </div>
                  <div className="mobile-card-actions">
                    <button
                      onClick={() => handleEditClick(record)}
                      className="med-btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recordId)}
                      className="med-btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}