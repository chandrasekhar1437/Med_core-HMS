import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, RefreshCw, FlaskConical, X, Edit2 } from "lucide-react";
import API from "../services/api";

export default function Laboratory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    patient_name: "",
    test_name: "",
    category: "Hematology",
    result: "",
    status: "Pending",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchLabRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/laboratory/");
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch lab records:", err);
      setError("Failed to fetch lab records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabRecords();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      patient_name: "",
      test_name: "",
      category: "Hematology",
      result: "",
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    const recordId = item.id || item._id;
    setEditingId(recordId);
    setFormData({
      patient_name: item.patient_name || "",
      test_name: item.test_name || "",
      category: item.category || "Hematology",
      result: item.result || "",
      status: item.status || "Pending",
      date: item.date || new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.patch(`/laboratory/${editingId}`, formData);
      } else {
        await API.post("/laboratory/", formData);
      }
      setIsModalOpen(false);
      fetchLabRecords();
    } catch (err) {
      console.error("Error saving lab record:", err);
      setError("Error saving lab record. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError("Cannot delete: Record ID is missing.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this lab record?")) return;
    try {
      await API.delete(`/laboratory/${id}`);
      fetchLabRecords();
    } catch (err) {
      console.error("Error deleting record:", err);
      setError("Failed to delete laboratory record.");
    }
  };

  const filtered = records.filter(
    (item) =>
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.test_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lab-container">
      <style>{`
        .lab-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;
        }

        .lab-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .lab-title {
          font-size: 1.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          color: #0f172a;
        }

        .lab-subtitle {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0.25rem 0 0 0;
        }

        .btn-add-test {
          background-color: #9333ea;
          color: #fff;
          padding: 0.6rem 1.2rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          transition: background-color 0.2s ease;
        }

        .btn-add-test:hover {
          background-color: #7e22ce;
        }

        .alert-error {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .lab-controls-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.6rem 0.75rem 0.6rem 2.25rem;
          border-radius: 0.5rem;
          border: 1px solid #cbd5e1;
          font-size: 0.875rem;
          box-sizing: border-box;
          outline: none;
        }

        .search-input:focus {
          border-color: #9333ea;
        }

        .btn-refresh {
          padding: 0.6rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Desktop Table View */
        .desktop-table-wrapper {
          background-color: #fff;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .lab-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }

        .lab-table th {
          background-color: #f8fafc;
          padding: 0.75rem 1rem;
          color: #475569;
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
        }

        .lab-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }

        .status-badge {
          padding: 0.25rem 0.6rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
        }

        /* Mobile View Cards */
        .mobile-cards-list {
          display: none;
          flex-direction: column;
          gap: 1rem;
        }

        .lab-mobile-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .mobile-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .patient-title-mobile {
          font-weight: 700;
          font-size: 1rem;
          color: #0f172a;
        }

        .mobile-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.875rem;
          color: #475569;
          margin-bottom: 1rem;
        }

        .mobile-card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .mobile-action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.5rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          background-color: #f8fafc;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        /* Modal Layout */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(2px);
        }

        .modal-card {
          background-color: #fff;
          padding: 1.5rem;
          border-radius: 0.5rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }

        .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .modal-form-grid input,
        .modal-form-grid select {
          padding: 0.6rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          outline: none;
          box-sizing: border-box;
          width: 100%;
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .lab-container {
            padding: 1rem;
          }

          .lab-header-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-add-test {
            width: 100%;
            justify-content: center;
          }

          .desktop-table-wrapper {
            display: none;
          }

          .mobile-cards-list {
            display: flex;
          }

          .modal-form-grid {
            grid-template-columns: 1fr;
          }

          .modal-actions-container {
            grid-column: span 1 !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="lab-header-row">
        <div>
          <h1 className="lab-title">
            <FlaskConical color="#9333ea" /> Laboratory Module
          </h1>
          <p className="lab-subtitle">
            Manage lab orders and diagnostic test results
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-add-test">
          <Plus size={18} /> New Test Record
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Controls */}
      <div className="lab-controls-row">
        <div className="search-input-wrapper">
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder="Search by patient, test name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={fetchLabRecords} className="btn-refresh" title="Refresh records">
          <RefreshCw size={18} color="#64748b" />
        </button>
      </div>

      {/* Desktop Table */}
      <div className="desktop-table-wrapper">
        <table className="lab-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Test Name</th>
              <th>Category</th>
              <th>Result</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                  Loading lab records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                  No test records found
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const recordId = item.id || item._id;
                return (
                  <tr key={recordId}>
                    <td style={{ fontWeight: "600", color: "#0f172a" }}>
                      {item.patient_name}
                    </td>
                    <td>{item.test_name}</td>
                    <td>{item.category}</td>
                    <td>{item.result || "Pending"}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: item.status === "Completed" ? "#dcfce7" : "#fef9c3",
                          color: item.status === "Completed" ? "#15803d" : "#a16207",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{item.date}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        style={{ border: "none", background: "none", cursor: "pointer", marginRight: "0.5rem" }}
                      >
                        <Edit2 size={16} color="#d97706" />
                      </button>
                      <button
                        onClick={() => handleDelete(recordId)}
                        style={{ border: "none", background: "none", cursor: "pointer" }}
                      >
                        <Trash2 size={16} color="#dc2626" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards-list">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            Loading lab records...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            No test records found
          </div>
        ) : (
          filtered.map((item) => {
            const recordId = item.id || item._id;
            return (
              <div key={recordId} className="lab-mobile-card">
                <div className="mobile-card-header">
                  <span className="patient-title-mobile">{item.patient_name}</span>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: item.status === "Completed" ? "#dcfce7" : "#fef9c3",
                      color: item.status === "Completed" ? "#15803d" : "#a16207",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="mobile-card-body">
                  <div><strong>Test:</strong> {item.test_name}</div>
                  <div><strong>Category:</strong> {item.category}</div>
                  <div><strong>Result:</strong> {item.result || "Pending"}</div>
                  <div><strong>Date:</strong> {item.date}</div>
                </div>
                <div className="mobile-card-actions">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="mobile-action-btn"
                    style={{ color: "#b45309" }}
                  >
                    <Edit2 size={15} color="#d97706" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(recordId)}
                    className="mobile-action-btn"
                    style={{ color: "#dc2626" }}
                  >
                    <Trash2 size={15} color="#dc2626" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1.125rem", fontWeight: "bold", margin: 0, color: "#0f172a" }}>
                {editingId ? "Edit Lab Record" : "New Lab Record"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form-grid">
              <input
                required
                placeholder="Patient Name"
                value={formData.patient_name}
                onChange={(e) =>
                  setFormData({ ...formData, patient_name: e.target.value })
                }
              />
              <input
                required
                placeholder="Test Name"
                value={formData.test_name}
                onChange={(e) =>
                  setFormData({ ...formData, test_name: e.target.value })
                }
              />
              <input
                required
                placeholder="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
              <input
                placeholder="Result"
                value={formData.result}
                onChange={(e) =>
                  setFormData({ ...formData, result: e.target.value })
                }
              />
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
              <div
                className="modal-actions-container"
                style={{
                  gridColumn: "span 2",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.375rem",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#9333ea",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {editingId ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}