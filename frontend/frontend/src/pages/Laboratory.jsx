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
      setRecords(res.data);
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
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              margin: 0,
            }}
          >
            <FlaskConical color="#9333ea" /> Laboratory Module
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
              margin: "0.25rem 0 0 0",
            }}
          >
            Manage lab orders and diagnostic test results
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          style={{
            backgroundColor: "#9333ea",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: "500",
          }}
        >
          <Plus size={18} /> New Test Record
        </button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
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
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem 0.5rem 2.25rem",
              borderRadius: "0.5rem",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={fetchLabRecords}
          style={{
            padding: "0.5rem",
            border: "1px solid #cbd5e1",
            borderRadius: "0.5rem",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={18} color="#64748b" />
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "0.5rem",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.875rem",
          }}
        >
          <thead
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              color: "#475569",
            }}
          >
            <tr>
              <th style={{ padding: "0.75rem 1rem" }}>Patient Name</th>
              <th style={{ padding: "0.75rem 1rem" }}>Test Name</th>
              <th style={{ padding: "0.75rem 1rem" }}>Category</th>
              <th style={{ padding: "0.75rem 1rem" }}>Result</th>
              <th style={{ padding: "0.75rem 1rem" }}>Status</th>
              <th style={{ padding: "0.75rem 1rem" }}>Date</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#94a3b8",
                  }}
                >
                  Loading lab records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#94a3b8",
                  }}
                >
                  No test records found
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const recordId = item.id || item._id;
                return (
                  <tr
                    key={recordId}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      {item.patient_name}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>{item.test_name}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>{item.category}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {item.result || "Pending"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          backgroundColor:
                            item.status === "Completed" ? "#dcfce7" : "#fef9c3",
                          color:
                            item.status === "Completed" ? "#15803d" : "#a16207",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>{item.date}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          marginRight: "0.5rem",
                        }}
                      >
                        <Edit2 size={16} color="#d97706" />
                      </button>
                      <button
                        onClick={() => handleDelete(recordId)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                        }}
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

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                {editingId ? "Edit Lab Record" : "New Lab Record"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              <input
                required
                placeholder="Patient Name"
                value={formData.patient_name}
                onChange={(e) =>
                  setFormData({ ...formData, patient_name: e.target.value })
                }
                style={{
                  padding: "0.5rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.25rem",
                }}
              />
              <input
                required
                placeholder="Test Name"
                value={formData.test_name}
                onChange={(e) =>
                  setFormData({ ...formData, test_name: e.target.value })
                }
                style={{
                  padding: "0.5rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.25rem",
                }}
              />
              <input
                required
                placeholder="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                style={{
                  padding: "0.5rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.25rem",
                }}
              />
              <input
                placeholder="Result"
                value={formData.result}
                onChange={(e) =>
                  setFormData({ ...formData, result: e.target.value })
                }
                style={{
                  padding: "0.5rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.25rem",
                }}
              />
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                style={{
                  padding: "0.5rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.25rem",
                }}
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
                style={{
                  padding: "0.5rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.25rem",
                }}
              />
              <div
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
                    borderRadius: "0.25rem",
                    background: "#fff",
                    cursor: "pointer",
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
                    borderRadius: "0.25rem",
                    cursor: "pointer",
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