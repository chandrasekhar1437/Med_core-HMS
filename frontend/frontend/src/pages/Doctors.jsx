import React, { useState, useEffect } from "react";
import API from "../services/api";
import "./Doctors.css";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Initialized with empty strings to prevent React controlled/uncontrolled warnings
  const [form, setForm] = useState({ name: "", specialty: "", contact: "" });

  // Fetch doctors from FastAPI backend
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await API.get("/doctors/");
      setDoctors(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors list from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleEdit = (doctor) => {
    setEditingId(doctor.id || doctor._id);
    setForm({
      name: doctor.name || "",
      specialty: doctor.specialty || "",
      contact: doctor.contact || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      await API.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      console.error("Error deleting doctor:", err);
      alert("Failed to delete doctor record.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.put(`/doctors/${editingId}`, form);
        setEditingId(null);
      } else {
        await API.post("/doctors/", form);
      }
      setForm({ name: "", specialty: "", contact: "" });
      fetchDoctors(); // Refresh list after POST/PUT
    } catch (err) {
      console.error("Error saving doctor:", err);
      alert("Failed to save doctor record.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", specialty: "", contact: "" });
  };

  return (
    <div className="doctors-container">
      <h2 className="doctors-title">Doctors Management</h2>

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSave} className="doctor-form">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="form-input"
          required
        />
        <input
          type="text"
          placeholder="Specialty"
          value={form.specialty}
          onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          className="form-input"
          required
        />
        <input
          type="text"
          placeholder="Contact"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          className="form-input"
          required
        />
        <button type="submit" className="btn-primary">
          {editingId ? "Update" : "Add"} Doctor
        </button>

        {editingId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="btn-secondary"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Desktop Table View */}
      <div className="desktop-table-wrapper">
        <table className="doctors-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialty</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "#64748b" }}>
                  Loading doctors...
                </td>
              </tr>
            ) : doctors.length > 0 ? (
              doctors.map((d) => (
                <tr key={d.id || d._id}>
                  <td>
                    <strong>{d.name}</strong>
                  </td>
                  <td>{d.specialty}</td>
                  <td>{d.contact}</td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleEdit(d)} className="btn-edit">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(d.id || d._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "#64748b" }}>
                  No doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards-list">
        {loading ? (
          <div style={{ textAlign: "center", color: "#64748b", padding: "16px" }}>
            Loading doctors...
          </div>
        ) : doctors.length > 0 ? (
          doctors.map((d) => (
            <div key={d.id || d._id} className="doctor-card">
              <div className="card-header-name">{d.name}</div>
              <div className="card-details-body">
                <div>
                  <strong>Specialty:</strong> {d.specialty}
                </div>
                <div>
                  <strong>Contact:</strong> {d.contact}
                </div>
              </div>
              <div className="card-actions-group">
                <button onClick={() => handleEdit(d)} className="btn-edit">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(d.id || d._id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", color: "#64748b", padding: "16px" }}>
            No doctors found.
          </div>
        )}
      </div>
    </div>
  );
}