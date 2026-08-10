import React, { useState, useEffect } from "react";
import api from "../services/api";

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
    return <div style={styles.loading}>Loading prescriptions...</div>;

  return (
    <div className="prescriptions-container" style={styles.container}>
      <style>{`
        .prescriptions-container {
          padding: 30px;
          max-width: 900px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;
        }

        .rx-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 15px;
        }

        /* Mobile Responsive Card List */
        .mobile-rx-list {
          display: none;
          flex-direction: column;
          gap: 12px;
          margin-top: 15px;
        }

        .mobile-rx-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .mobile-rx-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
        }

        .mobile-rx-patient {
          font-weight: 700;
          color: #0f172a;
          font-size: 16px;
        }

        .mobile-rx-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 14px;
          color: #475569;
          margin-bottom: 12px;
        }

        .mobile-rx-actions {
          display: flex;
          gap: 8px;
        }

        .mobile-rx-actions button {
          flex: 1;
          text-align: center;
        }

        @media (max-width: 768px) {
          .prescriptions-container {
            padding: 16px;
            margin: 10px auto;
          }

          .rx-form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .rx-btn-group {
            flex-direction: column;
          }

          .rx-btn-group button {
            width: 100%;
          }

          .desktop-table-wrapper {
            display: none;
          }

          .mobile-rx-list {
            display: flex;
          }
        }
      `}</style>

      <h2 style={styles.headerTitle}>Prescriptions Management</h2>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <h3 style={styles.formTitle}>
          {editingId ? "Edit Prescription" : "Add New Prescription"}
        </h3>

        <div className="rx-form-grid">
          <div style={styles.inputGroup}>
            <label style={styles.label}>Patient Name / ID:</label>
            <input
              type="text"
              value={form.patient}
              onChange={(e) => setForm({ ...form, patient: e.target.value })}
              placeholder="e.g. PAT-101 or John Doe"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Medicine:</label>
            <input
              type="text"
              value={form.medicine}
              onChange={(e) => setForm({ ...form, medicine: e.target.value })}
              placeholder="e.g. Amoxicillin"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Dosage:</label>
            <input
              type="text"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              placeholder="e.g. 500mg - 3x daily"
              required
              style={styles.input}
            />
          </div>
        </div>

        <div className="rx-btn-group" style={styles.buttonGroup}>
          <button type="submit" style={styles.primaryButton}>
            {editingId ? "Update Prescription" : "Save Prescription"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ patient: "", medicine: "", dosage: "" });
              }}
              style={styles.secondaryButton}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 style={styles.subHeader}>Prescriptions List</h3>
      {prescriptions.length === 0 ? (
        <p style={styles.noData}>No prescriptions found.</p>
      ) : (
        <>
          {/* Desktop View Table */}
          <div className="desktop-table-wrapper" style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Medicine</th>
                  <th style={styles.th}>Dosage</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((item, index) => {
                  const itemId = item.id || item._id;
                  return (
                    <tr
                      key={itemId}
                      style={index % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
                      <td style={styles.td}>
                        <strong>{item.patient}</strong>
                      </td>
                      <td style={styles.td}>{item.medicine}</td>
                      <td style={styles.td}>{item.dosage}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleEdit(item)}
                          style={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(itemId)}
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
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(itemId)}
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
    maxWidth: "900px",
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