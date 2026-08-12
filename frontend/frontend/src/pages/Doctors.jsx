import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Doctors.css";

export default function Doctors() {
  const { user } = useAuth();
  const role = (user?.role || "patient").toLowerCase();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");

  const [form, setForm] = useState({
    name: "",
    specialty: "General Medicine",
    contact: "",
    schedule: "09:00 AM - 05:00 PM",
    availability: "Available",
  });

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
      specialty: doctor.specialty || "General Medicine",
      contact: doctor.contact || "",
      schedule: doctor.schedule || "09:00 AM - 05:00 PM",
      availability: doctor.availability || "Available",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this physician record?")) return;

    try {
      await API.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      console.error("Error deleting doctor:", err);
      setError("Failed to delete doctor record.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        try {
          await API.patch(`/doctors/${editingId}`, form);
        } catch {
          await API.put(`/doctors/${editingId}`, form);
        }
        setEditingId(null);
      } else {
        await API.post("/doctors/", form);
      }
      setForm({
        name: "",
        specialty: "General Medicine",
        contact: "",
        schedule: "09:00 AM - 05:00 PM",
        availability: "Available",
      });
      fetchDoctors();
    } catch (err) {
      console.error("Error saving doctor:", err);
      setError("Failed to save doctor record.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      specialty: "General Medicine",
      contact: "",
      schedule: "09:00 AM - 05:00 PM",
      availability: "Available",
    });
  };

  const getAvailabilityBadge = (status) => {
    switch (status) {
      case "On Call":
        return <span className="status-badge badge-oncall">On Call</span>;
      case "In Surgery":
        return <span className="status-badge badge-insurgery">In Surgery</span>;
      case "On Leave":
        return <span className="status-badge badge-onleave">On Leave</span>;
      default:
        return <span className="status-badge badge-available">Available</span>;
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.contact?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      specialtyFilter === "All" || doc.specialty === specialtyFilter;

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="doctors-container">
      <h2 className="doctors-title">Physicians & Staff Directory</h2>

      {error && <div className="error-alert">{error}</div>}

      {/* Doctor Registration Form — Admin & Staff Only */}
      {role === "admin" && (
        <div className="doctor-form-card">
          <h3 className="doctor-form-title">
            {editingId ? "Edit Physician Credentials" : "Register New Physician"}
          </h3>
          <form onSubmit={handleSave}>
            <div className="doctor-form-grid">
              <div className="doctor-input-group">
                <label>Physician Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="doctor-input-group">
                <label>Specialty / Department</label>
                <select
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="form-select"
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="doctor-input-group">
                <label>Contact Number / Email</label>
                <input
                  type="text"
                  placeholder="e.g. +1 555-0192 or doctor@medcore.com"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="doctor-input-group">
                <label>Working Hours / Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Fri (09:00 AM - 05:00 PM)"
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="doctor-input-group">
                <label>Current Status</label>
                <select
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className="form-select"
                >
                  <option value="Available">Available</option>
                  <option value="On Call">On Call</option>
                  <option value="In Surgery">In Surgery</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? "Update Doctor" : "Add Doctor"}
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
            </div>
          </form>
        </div>
      )}

      {/* Directory & Filtering */}
      <h3 className="doctors-sub-title">Active Doctor Roster</h3>

      <div className="doctors-filter-bar">
        <input
          type="text"
          className="doctors-search-input"
          placeholder="Filter by name, specialty, or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="doctors-filter-select"
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
        >
          <option value="All">All Specialties</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Dermatology">Dermatology</option>
        </select>
      </div>

      {/* Desktop Table View */}
      <div className="desktop-table-wrapper">
        <table className="doctors-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Specialty</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Contact</th>
              {role === "admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={role === "admin" ? 6 : 5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  Loading doctors list...
                </td>
              </tr>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((d) => {
                const docId = d.id || d._id;
                return (
                  <tr key={docId}>
                    <td>
                      <strong>{d.name}</strong>
                    </td>
                    <td>{d.specialty}</td>
                    <td>{d.schedule || "09:00 AM - 05:00 PM"}</td>
                    <td>{getAvailabilityBadge(d.availability || "Available")}</td>
                    <td>{d.contact}</td>
                    {role === "admin" && (
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => handleEdit(d)} className="btn-edit">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(docId)}
                            className="btn-delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={role === "admin" ? 6 : 5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  No doctors found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards-list">
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px" }}>
            Loading doctors list...
          </div>
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((d) => {
            const docId = d.id || d._id;
            return (
              <div key={docId} className="doctor-card">
                <div className="card-header-row">
                  <span className="card-header-name">{d.name}</span>
                  {getAvailabilityBadge(d.availability || "Available")}
                </div>
                <div className="card-details-body">
                  <div><strong>Specialty:</strong> {d.specialty}</div>
                  <div><strong>Schedule:</strong> {d.schedule || "09:00 AM - 05:00 PM"}</div>
                  <div><strong>Contact:</strong> {d.contact}</div>
                </div>
                {role === "admin" && (
                  <div className="card-actions-group">
                    <button onClick={() => handleEdit(d)} className="btn-edit">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(docId)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px" }}>
            No doctors found.
          </div>
        )}
      </div>
    </div>
  );
}