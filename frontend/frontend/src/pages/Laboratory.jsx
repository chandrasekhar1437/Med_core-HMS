import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, RefreshCw, FlaskConical, X, Edit2 } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Laboratory.css";

export default function Laboratory() {
  const { user } = useAuth();
  const role = (user?.role || "patient").toLowerCase();

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
      patient_name: role === "patient" ? user?.name || "" : "",
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
        try {
          await API.patch(`/laboratory/${editingId}`, formData);
        } catch {
          await API.put(`/laboratory/${editingId}`, formData);
        }
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return <span className="status-badge status-completed">Completed</span>;
      case "Processing":
        return <span className="status-badge status-processing">Processing</span>;
      default:
        return <span className="status-badge status-pending">Pending</span>;
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
      {/* Header */}
      <div className="lab-header-row">
        <div>
          <h1 className="lab-title">
            <FlaskConical color="var(--primary, #0284c7)" /> Laboratory Module
          </h1>
          <p className="lab-subtitle">
            Manage diagnostic test orders, pending labs, and patient reports
          </p>
        </div>
        {role !== "patient" && (
          <button onClick={handleOpenAddModal} className="btn-add-test">
            <Plus size={18} /> New Test Record
          </button>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Controls */}
      <div className="lab-controls-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by patient, test name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={fetchLabRecords} className="btn-refresh" title="Refresh records">
          <RefreshCw size={18} color="var(--text-muted, #64748b)" />
        </button>
      </div>

      {/* Desktop Table View */}
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
              {role !== "patient" && <th style={{ textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={role !== "patient" ? 7 : 6} className="empty-state">
                  Loading lab records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={role !== "patient" ? 7 : 6} className="empty-state">
                  No test records found
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const recordId = item.id || item._id;
                return (
                  <tr key={recordId}>
                    <td style={{ fontWeight: "600", color: "var(--text-main)" }}>
                      {item.patient_name}
                    </td>
                    <td>{item.test_name}</td>
                    <td>{item.category}</td>
                    <td>{item.result || "Pending"}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>{item.date}</td>
                    {role !== "patient" && (
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="icon-btn icon-btn-edit"
                          title="Edit Record"
                        >
                          <Edit2 size={16} color="var(--warning, #d97706)" />
                        </button>
                        <button
                          onClick={() => handleDelete(recordId)}
                          className="icon-btn"
                          title="Delete Record"
                        >
                          <Trash2 size={16} color="var(--danger, #dc2626)" />
                        </button>
                      </td>
                    )}
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
          <div className="empty-state">Loading lab records...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No test records found</div>
        ) : (
          filtered.map((item) => {
            const recordId = item.id || item._id;
            return (
              <div key={recordId} className="lab-mobile-card">
                <div className="mobile-card-header">
                  <span className="patient-title-mobile">{item.patient_name}</span>
                  {getStatusBadge(item.status)}
                </div>
                <div className="mobile-card-body">
                  <div><strong>Test:</strong> {item.test_name}</div>
                  <div><strong>Category:</strong> {item.category}</div>
                  <div><strong>Result:</strong> {item.result || "Pending"}</div>
                  <div><strong>Date:</strong> {item.date}</div>
                </div>
                {role !== "patient" && (
                  <div className="mobile-card-actions">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="mobile-action-btn"
                      style={{ color: "var(--warning, #b45309)" }}
                    >
                      <Edit2 size={15} color="var(--warning, #d97706)" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recordId)}
                      className="mobile-action-btn"
                      style={{ color: "var(--danger, #dc2626)" }}
                    >
                      <Trash2 size={15} color="var(--danger, #dc2626)" /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? "Edit Lab Record" : "New Lab Record"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
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
                placeholder="Test Name (e.g. Lipid Profile, Complete Blood Count)"
                value={formData.test_name}
                onChange={(e) =>
                  setFormData({ ...formData, test_name: e.target.value })
                }
              />
              <input
                required
                placeholder="Category (e.g. Hematology, Biochemistry)"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
              <input
                placeholder="Result / Diagnostic Value"
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
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
              </select>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
              <div className="modal-actions-container">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
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