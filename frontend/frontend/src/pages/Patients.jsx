import React, { useState, useEffect } from "react";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/patientApi";
import { useAuth } from "../context/AuthContext";
import "./Patients.css";

export default function Patients() {
  const { user } = useAuth();
  const role = (user?.role || "patient").toLowerCase();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    condition: "",
    contact: "",
    blood_group: "Unknown",
  });

  const fetchPatientsList = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        age: form.age !== "" ? Number(form.age) : undefined,
      };

      if (editingId) {
        await updatePatient(editingId, payload);
      } else {
        await createPatient(payload);
      }

      setForm({
        name: "",
        age: "",
        gender: "",
        condition: "",
        contact: "",
        blood_group: "Unknown",
      });
      setEditingId(null);
      fetchPatientsList();
    } catch (err) {
      console.error("Error saving patient:", err);
      setError("Failed to save patient record.");
    }
  };

  const handleEdit = (item) => {
    const targetId = item.id || item._id;
    setEditingId(targetId);
    setForm({
      name: item.name || "",
      age: item.age || "",
      gender: item.gender || "",
      condition: item.condition || "",
      contact: item.contact || "",
      blood_group: item.blood_group || "Unknown",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (item) => {
    const targetId = item.id || item._id;

    if (!targetId) {
      setError("Could not delete patient: ID is missing.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this patient record?")) return;

    try {
      await deletePatient(targetId);
      fetchPatientsList();
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("Failed to delete patient.");
    }
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.condition?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender =
      genderFilter === "All" || p.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  if (loading && patients.length === 0)
    return <div className="patients-loading">Loading patient records...</div>;

  return (
    <div className="patients-container">
      <h2 className="patients-header-title">Patients Directory & Onboarding</h2>

      {error && <div className="patients-error-banner">{error}</div>}

      {/* Patient Intake Form — Accessible to Doctors, Nurses, Staff, and Admins */}
      {role !== "patient" && (
        <form onSubmit={handleSubmit} className="patients-form-card">
          <h3 className="patients-form-title">
            {editingId ? "Edit Patient Details" : "Register New Patient Intake"}
          </h3>

          <div className="patient-form-grid">
            <div className="patients-input-group">
              <label className="patients-label">Full Name:</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="patients-input"
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div className="patients-input-group">
              <label className="patients-label">Age:</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                required
                className="patients-input"
                placeholder="e.g. 32"
              />
            </div>

            <div className="patients-input-group">
              <label className="patients-label">Gender:</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                required
                className="patients-select"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="patients-input-group">
              <label className="patients-label">Primary Condition / Reason:</label>
              <input
                type="text"
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                required
                className="patients-input"
                placeholder="e.g. Hypertension, Routine Checkup"
              />
            </div>

            <div className="patients-input-group">
              <label className="patients-label">Contact / Phone:</label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="patients-input"
                placeholder="e.g. +1 555-0192"
              />
            </div>

            <div className="patients-input-group">
              <label className="patients-label">Blood Group:</label>
              <select
                value={form.blood_group}
                onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                className="patients-select"
              >
                <option value="Unknown">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="patient-btn-group">
            <button type="submit" className="patients-primary-button">
              {editingId ? "Update Patient" : "Save Patient"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    name: "",
                    age: "",
                    gender: "",
                    condition: "",
                    contact: "",
                    blood_group: "Unknown",
                  });
                }}
                className="patients-secondary-button"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Directory Section */}
      <h3 className="patients-sub-header">Registered Patient Roster</h3>

      <div className="patients-filter-bar">
        <input
          type="text"
          className="patients-search-input"
          placeholder="Filter by patient name or condition..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="patients-filter-select"
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
        >
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {filteredPatients.length === 0 ? (
        <p className="patients-no-data">No patients found matching your search.</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-table-wrapper">
            <table className="patients-table">
              <thead>
                <tr className="patients-table-header-row">
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Blood Group</th>
                  <th>Condition</th>
                  {role !== "patient" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((item, index) => {
                  const patientId = item.id || item._id;
                  return (
                    <tr
                      key={patientId}
                      className={index % 2 === 0 ? "patients-tr-even" : "patients-tr-odd"}
                    >
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td>{item.age}</td>
                      <td>
                        <span className="gender-badge">{item.gender}</span>
                      </td>
                      <td>{item.blood_group || "Unknown"}</td>
                      <td>{item.condition}</td>
                      {role !== "patient" && (
                        <td>
                          <button
                            onClick={() => handleEdit(item)}
                            className="patients-edit-button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="patients-delete-button"
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
          <div className="mobile-patients-list">
            {filteredPatients.map((item) => {
              const patientId = item.id || item._id;
              return (
                <div key={patientId} className="patient-card-mobile">
                  <div className="mobile-patient-header">
                    <span className="mobile-patient-name">{item.name}</span>
                    <span className="gender-badge">{item.gender}</span>
                  </div>
                  <div className="mobile-patient-body">
                    <div><strong>Age:</strong> {item.age}</div>
                    <div><strong>Blood Group:</strong> {item.blood_group || "Unknown"}</div>
                    <div><strong>Condition:</strong> {item.condition}</div>
                    {item.contact && <div><strong>Contact:</strong> {item.contact}</div>}
                  </div>
                  {role !== "patient" && (
                    <div className="mobile-card-actions">
                      <button
                        onClick={() => handleEdit(item)}
                        className="patients-edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="patients-delete-button"
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