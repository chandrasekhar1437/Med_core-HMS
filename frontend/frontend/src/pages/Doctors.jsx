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
      setDoctors(response.data);
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
    <div
      style={{
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#333",
        }}
      >
        Doctors Management
      </h2>

      {error && <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>}

      <form
        onSubmit={handleSave}
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "24px",
          background: "#f9f9f9",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            flex: "1 1 200px",
          }}
          required
        />
        <input
          type="text"
          placeholder="Specialty"
          value={form.specialty}
          onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            flex: "1 1 200px",
          }}
          required
        />
        <input
          type="text"
          placeholder="Contact"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            flex: "1 1 200px",
          }}
          required
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#007BFF",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {editingId ? "Update" : "Add"} Doctor
        </button>

        {editingId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f1f1f1", textAlign: "left" }}>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Name
            </th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Specialty
            </th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Contact
            </th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" style={{ padding: "12px", textAlign: "center" }}>
                Loading doctors...
              </td>
            </tr>
          ) : doctors.length > 0 ? (
            doctors.map((d) => (
              <tr key={d.id || d._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }}>{d.name}</td>
                <td style={{ padding: "12px" }}>{d.specialty}</td>
                <td style={{ padding: "12px" }}>{d.contact}</td>
                <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleEdit(d)}
                    style={{
                      backgroundColor: "#ffc107",
                      color: "#212529",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(d.id || d._id)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ padding: "12px", textAlign: "center" }}>
                No doctors found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}