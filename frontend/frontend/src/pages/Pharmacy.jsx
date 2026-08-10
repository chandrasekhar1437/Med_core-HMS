import React, { useState, useEffect } from "react";
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../services/pharmacyApi";
import "./Pharmacy.css";

export default function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "Antibiotic",
    dosage: "",
    stock_quantity: "",
    unit_price: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMedicines();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching pharmacy inventory:", err);
      const serverMsg = err.response?.data?.detail;
      setError(
        typeof serverMsg === "string"
          ? serverMsg
          : "Failed to load medicine stock inventory."
      );
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
      const payload = {
        ...form,
        stock_quantity: Number(form.stock_quantity),
        unit_price: Number(form.unit_price),
      };

      if (editingId) {
        await updateMedicine(editingId, payload);
        setEditingId(null);
      } else {
        await createMedicine(payload);
      }

      setForm({
        name: "",
        category: "Antibiotic",
        dosage: "",
        stock_quantity: "",
        unit_price: "",
      });
      fetchMedicines();
    } catch (err) {
      console.error("Error saving medicine record:", err);
      const serverMsg = err.response?.data?.detail;
      setError(
        typeof serverMsg === "string"
          ? serverMsg
          : "Failed to save medicine record."
      );
    }
  };

  const handleEditClick = (med) => {
    const medId = med.id || med._id;
    setEditingId(medId);
    setForm({
      name: med.name || "",
      category: med.category || "Antibiotic",
      dosage: med.dosage || "",
      stock_quantity: med.stock_quantity || "",
      unit_price: med.unit_price || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      category: "Antibiotic",
      dosage: "",
      stock_quantity: "",
      unit_price: "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this medicine from inventory?")) return;
    try {
      await deleteMedicine(id);
      fetchMedicines();
    } catch (err) {
      console.error("Error deleting medicine:", err);
      setError("Failed to delete medicine.");
    }
  };

  return (
    <div className="pharmacy-container">
      <h2 className="pharmacy-header">Pharmacy & Medicine Inventory</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="pharmacy-card-form">
        <h3 className="form-title">
          {editingId ? "Edit Medicine Record" : "Add Medicine to Stock"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Medicine Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Amoxicillin, Paracetamol"
                value={form.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleInputChange}>
                <option value="Antibiotic">Antibiotic</option>
                <option value="Painkiller">Painkiller</option>
                <option value="Antiviral">Antiviral</option>
                <option value="Supplement">Supplement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Dosage</label>
              <input
                type="text"
                name="dosage"
                placeholder="e.g. 500mg, 10ml"
                value={form.dosage}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                placeholder="Number of units"
                value={form.stock_quantity}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                name="unit_price"
                placeholder="Price per unit"
                value={form.unit_price}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Stock" : "Add to Inventory"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h3>Stock Directory</h3>
      <div className="table-container">
        {loading ? (
          <div className="no-data">Loading inventory...</div>
        ) : medicines.length === 0 ? (
          <div className="no-data">No medicines in inventory yet.</div>
        ) : (
          <table className="pharmacy-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Dosage</th>
                <th>Stock Left</th>
                <th>Unit Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => {
                const medId = med.id || med._id;
                const isLowStock = med.stock_quantity < 10;
                return (
                  <tr key={medId}>
                    <td>
                      <strong>{med.name}</strong>
                    </td>
                    <td>{med.category}</td>
                    <td>{med.dosage}</td>
                    <td>
                      <span className={`badge-stock ${isLowStock ? "stock-low" : "stock-in"}`}>
                        {med.stock_quantity} units
                      </span>
                    </td>
                    <td>${Number(med.unit_price).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-edit" onClick={() => handleEditClick(med)}>
                        Edit
                      </button>
                      <button className="btn btn-delete" onClick={() => handleDelete(medId)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}