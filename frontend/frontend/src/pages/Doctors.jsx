import React, { useState, useEffect } from "react";
import API from "../services/api";

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
      <style>
        {`
          .doctors-container {
            padding: 24px;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            box-sizing: border-box;
          }

          .doctors-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 16px;
            color: #1e293b;
          }

          .error-alert {
            color: #b91c1c;
            background-color: #fee2e2;
            border: 1px solid #fca5a5;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 16px;
            font-size: 14px;
          }

          .doctor-form {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 24px;
            background: #f8fafc;
            padding: 18px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }

          .form-input {
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            flex: 1 1 200px;
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
            background-color: #ffffff;
          }

          .form-input:focus {
            border-color: #0284c7;
          }

          .btn-primary {
            background-color: #0284c7;
            color: white;
            padding: 10px 18px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
          }

          .btn-secondary {
            background-color: #64748b;
            color: white;
            padding: 10px 18px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
          }

          .btn-edit {
            background-color: #f59e0b;
            color: #ffffff;
            border: none;
            padding: 8px 14px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
          }

          .btn-delete {
            background-color: #ef4444;
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
          }

          /* Desktop Table View */
          .desktop-table-wrapper {
            overflow-x: auto;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }

          .doctors-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 14px;
          }

          .doctors-table th {
            background-color: #f1f5f9;
            padding: 12px 16px;
            color: #475569;
            font-weight: 600;
            border-bottom: 1px solid #e2e8f0;
          }

          .doctors-table td {
            padding: 12px 16px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
          }

          /* Mobile Cards View */
          .mobile-cards-list {
            display: none;
            flex-direction: column;
            gap: 12px;
          }

          .doctor-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }

          .card-header-name {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
          }

          .card-details-body {
            font-size: 14px;
            color: #475569;
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 12px;
          }

          .card-actions-group {
            display: flex;
            gap: 8px;
          }

          .card-actions-group button {
            flex: 1;
            text-align: center;
          }

          @media (max-width: 640px) {
            .doctors-container {
              padding: 16px;
            }

            .doctor-form {
              flex-direction: column;
            }

            .form-input, .btn-primary, .btn-secondary {
              width: 100%;
            }

            .desktop-table-wrapper {
              display: none;
            }

            .mobile-cards-list {
              display: flex;
            }
          }
        `}
      </style>

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
                  <td><strong>{d.name}</strong></td>
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
                <div><strong>Specialty:</strong> {d.specialty}</div>
                <div><strong>Contact:</strong> {d.contact}</div>
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