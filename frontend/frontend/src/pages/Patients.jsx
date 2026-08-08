import React, { useState, useEffect } from "react";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/patientApi";

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
      setPatients(data);
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
    return <div style={styles.loading}>Loading patients...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.headerTitle}>Patients Management</h2>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <h3 style={styles.formTitle}>
          {editingId ? "Edit Patient" : "Add New Patient"}
        </h3>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name:</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Age:</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Gender:</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            required
            style={styles.input}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Condition:</label>
          <input
            type="text"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.primaryButton}>
            {editingId ? "Update Patient" : "Save Patient"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", age: "", gender: "", condition: "" });
              }}
              style={styles.secondaryButton}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 style={styles.subHeader}>Patients List</h3>
      {patients.length === 0 ? (
        <p style={styles.noData}>No patients found.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Age</th>
                <th style={styles.th}>Gender</th>
                <th style={styles.th}>Condition</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((item, index) => (
                <tr
                  key={item.id || item._id}
                  style={index % 2 === 0 ? styles.trEven : styles.trOdd}
                >
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.age}</td>
                  <td style={styles.td}>{item.gender}</td>
                  <td style={styles.td}>{item.condition}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "950px",
    margin: "30px auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  headerTitle: {
    color: "#2c3e50",
    marginBottom: "20px",
    borderBottom: "2px solid #eaeaea",
    paddingBottom: "10px",
  },
  subHeader: {
    color: "#34495e",
    marginTop: "30px",
    marginBottom: "15px",
  },
  loading: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
    color: "#7f8c8d",
  },
  errorBanner: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "20px",
    border: "1px solid #f5c6cb",
  },
  formCard: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "6px",
    border: "1px solid #e9ecef",
    marginBottom: "25px",
  },
  formTitle: {
    marginTop: "0",
    marginBottom: "15px",
    color: "#495057",
    fontSize: "18px",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "600",
    color: "#495057",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  primaryButton: {
    padding: "10px 18px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
  },
  secondaryButton: {
    padding: "10px 18px",
    backgroundColor: "#6c757d",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "14px",
  },
  tableHeaderRow: {
    backgroundColor: "#343a40",
    color: "#ffffff",
  },
  th: {
    padding: "12px",
    borderBottom: "2px solid #dee2e6",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #dee2e6",
  },
  trEven: {
    backgroundColor: "#fdfdfd",
  },
  trOdd: {
    backgroundColor: "#f8f9fa",
  },
  editButton: {
    padding: "6px 12px",
    backgroundColor: "#ffc107",
    color: "#212529",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "6px",
    fontWeight: "600",
  },
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#dc3545",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
  },
  noData: {
    color: "#6c757d",
    fontStyle: "italic",
  },
};