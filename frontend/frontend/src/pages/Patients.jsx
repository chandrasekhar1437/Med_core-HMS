import React, { useState, useEffect } from "react";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/patientApi";
import "./Patients.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Form state tracking fields matching backend schema
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    condition: "",
  });

  // Fetch the list of patients from the backend server
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

  // Handle form submission for both creating and updating a patient
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure age is passed as a number to satisfy FastAPI validation schemas
      const payload = {
        ...form,
        age: form.age !== "" ? Number(form.age) : undefined,
      };

      if (editingId) {
        await updatePatient(editingId, payload);
      } else {
        await createPatient(payload);
      }

      // Reset form and reload patient list
      setForm({ name: "", age: "", gender: "", condition: "" });
      setEditingId(null);
      fetchPatientsList();
    } catch (err) {
      console.error("Error saving patient:", err);
      setError("Failed to save patient. Check console for details.");
    }
  };

  // Populate form fields with selected patient data for editing
  const handleEdit = (item) => {
    const targetId = item.id || item._id;
    setEditingId(targetId);
    setForm({
      name: item.name || "",
      age: item.age || "",
      gender: item.gender || "",
      condition: item.condition || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle patient deletion securely using id or _id fallback
  const handleDelete = async (item) => {
    const targetId = item.id || item._id;

    if (!targetId) {
      console.error("Patient ID is missing!");
      setError("Could not delete patient: ID is missing.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this patient?")) return;

    try {
      await deletePatient(targetId);
      fetchPatientsList();
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("Failed to delete patient.");
    }
  };

  if (loading && patients.length === 0)
    return <div className="patients-loading">Loading patients...</div>;

  return (
    <div className="patients-container">
      <h2 className="patients-header-title">Patients Management</h2>

      {error && <div className="patients-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="patients-form-card">
        <h3 className="patients-form-title">
          {editingId ? "Edit Patient" : "Add New Patient"}
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
              placeholder="e.g. John Doe"
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
        </div>

        <div className="patient-form-grid">
          <div className="patients-input-group">
            <label className="patients-label">Gender:</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              required
              className="patients-input"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="patients-input-group">
            <label className="patients-label">Condition:</label>
            <input
              type="text"
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              required
              className="patients-input"
              placeholder="e.g. Hypertension"
            />
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
                setForm({ name: "", age: "", gender: "", condition: "" });
              }}
              className="patients-secondary-button"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="patients-sub-header">Patients List</h3>
      {patients.length === 0 ? (
        <p className="patients-no-data">No patients found.</p>
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
                  <th>Condition</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((item, index) => (
                  <tr
                    key={item.id || item._id}
                    className={index % 2 === 0 ? "patients-tr-even" : "patients-tr-odd"}
                  >
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{item.age}</td>
                    <td>{item.gender}</td>
                    <td>{item.condition}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View Cards */}
          <div className="mobile-patients-list">
            {patients.map((item) => (
              <div key={item.id || item._id} className="patient-card-mobile">
                <div className="mobile-patient-header">
                  <span className="mobile-patient-name">{item.name}</span>
                  <span className="gender-badge">{item.gender}</span>
                </div>
                <div className="mobile-patient-body">
                  <div><strong>Age:</strong> {item.age}</div>
                  <div><strong>Condition:</strong> {item.condition}</div>
                </div>
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
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}