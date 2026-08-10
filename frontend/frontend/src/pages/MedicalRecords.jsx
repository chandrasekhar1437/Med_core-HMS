import React, { useState, useEffect } from "react";
import API from "../services/api";

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
    return <div style={styles.loading}>Loading medical records...</div>;
  }

  return (
    <div className="med-records-container" style={styles.container}>
      <style>{`
        .med-records-container {
          padding: 30px;
          max-width: 950px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;
        }

        .med-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        /* Mobile Responsive Card List */
        .mobile-records-list {
          display: none;
          flex-direction: column;
          gap: 12px;
          margin-top: 15px;
        }

        .mobile-record-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .mobile-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
        }

        .mobile-patient-id {
          font-weight: 700;
          color: #0284c7;
          font-size: 15px;
        }

        .mobile-card-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 14px;
          color: #475569;
          margin-bottom: 12px;
        }

        .mobile-card-actions {
          display: flex;
          gap: 8px;
        }

        .mobile-card-actions button {
          flex: 1;
          padding: 8px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .med-records-container {
            padding: 16px;
            margin: 10px auto;
          }

          .med-form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .med-btn-group {
            flex-direction: column;
          }

          .med-btn-group button {
            width: 100%;
          }

          .desktop-table-wrapper {
            display: none;
          }

          .mobile-records-list {
            display: flex;
          }
        }
      `}</style>

      <h2 style={styles.headerTitle}>Medical Records Management</h2>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <h3 style={styles.formTitle}>
          {editingId ? "Edit Medical Record" : "Add Medical Record"}
        </h3>

        <div className="med-form-grid">
          <div style={styles.inputGroup}>
            <label style={styles.label}>Patient ID / Name:</label>
            <input
              type="text"
              name="patient_id"
              placeholder="e.g. PAT-101"
              value={form.patient_id || ""}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Diagnosis:</label>
            <input
              type="text"
              name="diagnosis"
              placeholder="Primary Diagnosis"
              value={form.diagnosis || ""}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </div>
        </div>

        <div className="med-form-grid">
          <div style={styles.inputGroup}>
            <label style={styles.label}>Prescription:</label>
            <input
              type="text"
              name="prescription"
              placeholder="Prescription details"
              value={form.prescription || ""}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Clinical Notes:</label>
            <input
              type="text"
              name="notes"
              placeholder="Additional remarks"
              value={form.notes || ""}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>
        </div>

        <div className="med-btn-group" style={styles.buttonGroup}>
          <button type="submit" style={styles.primaryButton}>
            {editingId ? "Update Record" : "Add Record"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              style={styles.secondaryButton}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 style={styles.subHeader}>Existing Clinical Records</h3>

      {records.length === 0 ? (
        <p style={styles.noData}>No medical records found.</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-table-wrapper" style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Patient ID</th>
                  <th style={styles.th}>Diagnosis</th>
                  <th style={styles.th}>Prescription</th>
                  <th style={styles.th}>Notes</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => {
                  const recordId = record.id || record._id;
                  return (
                    <tr
                      key={recordId}
                      style={index % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
                      <td style={styles.td}>
                        <strong>{record.patient_id}</strong>
                      </td>
                      <td style={styles.td}>{record.diagnosis}</td>
                      <td style={styles.td}>{record.prescription || "—"}</td>
                      <td style={styles.td}>{record.notes || "—"}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleEditClick(record)}
                          style={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(recordId)}
                          style={styles.deleteButton}
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
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recordId)}
                      style={styles.deleteButton}
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
    backgroundColor: "#ffffff",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  primaryButton: {
    padding: "10px 18px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  secondaryButton: {
    padding: "10px 18px",
    backgroundColor: "#6c757d",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
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
    fontSize: "13px",
  },
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#dc3545",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  noData: {
    color: "#6c757d",
    fontStyle: "italic",
  },
};