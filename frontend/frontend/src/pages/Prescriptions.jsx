import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./Prescriptions.css";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ patient: "", medicine: "", dosage: "" });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/prescriptions/${editingId}`, form);
      } else {
        await api.post("/prescriptions/", form);
      }
      setForm({ patient: "", medicine: "", dosage: "" });
      setEditingId(null);
      fetchPrescriptions();
    } catch (err) {
      console.error("Error saving prescription:", err);
      setError("Failed to save prescription.");
    }
  };

  const handleEdit = (item) => {
    const targetId = item.id || item._id;
    setEditingId(targetId);
    setForm({
      patient: item.patient || "",
      medicine: item.medicine || "",
      dosage: item.dosage || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError("Cannot delete prescription: ID is missing.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      fetchPrescriptions();
    } catch (err) {
      console.error("Error deleting prescription:", err);
      setError("Failed to delete prescription.");
    }
  };

  if (loading && prescriptions.length === 0)
    return <div className="rx-loading">Loading prescriptions...</div>;

  return (
    <div className="prescriptions-container">
      <h2 className="rx-header-title">Prescriptions Management</h2>

      {error && <div className="rx-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="rx-form-card">
        <h3 className="rx-form-title">
          {editingId ? "Edit Prescription" : "Add New Prescription"}
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
            <label className="rx-label">Medicine:</label>
            <input
              type="text"
              value={form.medicine}
              onChange={(e) => setForm({ ...form, medicine: e.target.value })}
              placeholder="e.g. Amoxicillin"
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
              placeholder="e.g. 500mg - 3x daily"
              required
              className="rx-input"
            />
          </div>
        </div>

        <div className="rx-btn-group">
          <button type="submit" className="rx-btn-primary">
            {editingId ? "Update Prescription" : "Save Prescription"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ patient: "", medicine: "", dosage: "" });
              }}
              className="rx-btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="rx-sub-header">Prescriptions List</h3>
      {prescriptions.length === 0 ? (
        <p className="rx-no-data">No prescriptions found.</p>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((item, index) => {
                  const itemId = item.id || item._id;
                  return (
                    <tr
                      key={itemId}
                      className={index % 2 === 0 ? "rx-tr-even" : "rx-tr-odd"}
                    >
                      <td>
                        <strong>{item.patient}</strong>
                      </td>
                      <td>{item.medicine}</td>
                      <td>{item.dosage}</td>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View Cards */}
          <div className="mobile-rx-list">
            {prescriptions.map((item) => {
              const itemId = item.id || item._id;
              return (
                <div key={itemId} className="mobile-rx-card">
                  <div className="mobile-rx-header">
                    <span className="mobile-rx-patient">{item.patient}</span>
                  </div>
                  <div className="mobile-rx-body">
                    <div>
                      <strong>Medicine:</strong> {item.medicine}
                    </div>
                    <div>
                      <strong>Dosage:</strong> {item.dosage}
                    </div>
                  </div>
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
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}