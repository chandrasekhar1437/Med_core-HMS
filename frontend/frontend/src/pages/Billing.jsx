import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { exportToCSV } from "../utils/exportCsv";
import API from "../services/api";
import styles from "./Billing.module.css";

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    patient_name: "",
    doctor_name: "",
    amount: "",
    status: "Pending",
    due_date: "",
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    patient_name: "",
    doctor_name: "",
    amount: "",
    status: "Pending",
    due_date: "",
  });

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/billing/");
      const data = response.data;
      setInvoices(Array.isArray(data) ? data : data.invoices || []);
    } catch (err) {
      console.error("Error loading billing data:", err);
      setError("Failed to fetch billing records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const filteredInvoices = invoices.filter((invoice) => {
    if (statusFilter === "All") return true;
    return invoice.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleExportCSV = () => {
    const columnMapping = {
      id: "Invoice ID",
      patient_name: "Patient Name",
      doctor_name: "Attending Doctor",
      amount: "Amount ($)",
      status: "Payment Status",
      due_date: "Due Date",
      created_at: "Issue Date",
    };
    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCSV(
      filteredInvoices.map((inv) => ({ ...inv, id: inv.id || inv._id })),
      `Billing_Records_${statusFilter}_${dateStr}.csv`,
      columnMapping
    );
  };

  const generatePDF = (invoice) => {
    const invId = invoice.id || invoice._id || "N/A";
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("MEDICAL CLINIC INVOICE", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice ID: #${invId}`, 14, 30);
    doc.text(
      `Issue Date: ${invoice.created_at || new Date().toISOString().slice(0, 10)}`,
      14,
      36
    );
    doc.text(`Due Date: ${invoice.due_date || "N/A"}`, 14, 42);

    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, 48, 182, 32, 2, 2, "FD");

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Billed To: ${invoice.patient_name || "N/A"}`, 20, 58);
    doc.text(`Attending Doctor: ${invoice.doctor_name || "N/A"}`, 20, 66);
    doc.text(`Payment Status: ${(invoice.status || "N/A").toUpperCase()}`, 20, 74);

    const tableData = [
      [
        `Medical Services rendered for ${invoice.patient_name || "Patient"}`,
        "1",
        `$${Number(invoice.amount || 0).toFixed(2)}`,
        `$${Number(invoice.amount || 0).toFixed(2)}`,
      ],
    ];

    doc.autoTable({
      startY: 88,
      head: [["Description", "Qty", "Unit Price", "Total"]],
      body: tableData,
      headStyles: { fillColor: [40, 116, 240], textColor: [255, 255, 255] },
      theme: "striped",
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(
      `Total Amount Due: $${Number(invoice.amount || 0).toFixed(2)}`,
      130,
      finalY
    );

    return doc;
  };

  const handleExportPDF = (invoice) => {
    const invId = invoice.id || invoice._id || "Invoice";
    const doc = generatePDF(invoice);
    doc.save(`Invoice_${invId}_${invoice.patient_name || "Patient"}.pdf`);
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert("Cannot delete invoice: ID is missing.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await API.delete(`/billing/${id}`);
      setInvoices(invoices.filter((inv) => (inv.id || inv._id) !== id));
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert("Failed to delete invoice.");
    }
  };

  const handleOpenEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setEditForm({
      patient_name: invoice.patient_name || "",
      doctor_name: invoice.doctor_name || "",
      amount: invoice.amount || "",
      status: invoice.status || "Pending",
      due_date: invoice.due_date || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const invId = selectedInvoice.id || selectedInvoice._id;
    try {
      const response = await API.put(`/billing/${invId}`, {
        ...editForm,
        amount: parseFloat(editForm.amount),
      });
      setInvoices(
        invoices.map((inv) =>
          (inv.id || inv._id) === invId ? response.data : inv
        )
      );
      setIsEditOpen(false);
    } catch (err) {
      console.error("Error updating invoice:", err);
      alert("Failed to update invoice.");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...addForm,
      amount: parseFloat(addForm.amount),
    };

    try {
      const response = await API.post("/billing/", payload);
      setInvoices([response.data, ...invoices]);
      setIsAddOpen(false);
      setAddForm({
        patient_name: "",
        doctor_name: "",
        amount: "",
        status: "Pending",
        due_date: "",
      });
    } catch (err) {
      console.error("Error adding invoice:", err.response?.data || err);
      alert(
        "Failed to add invoice: " +
          JSON.stringify(err.response?.data || err.message, null, 2)
      );
    }
  };
  const totalRevenue = filteredInvoices
    .filter((inv) => inv.status?.toLowerCase() === "paid")
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  const pendingAmount = filteredInvoices
    .filter((inv) => inv.status?.toLowerCase() === "pending")
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Billing & Invoices</h1>
          <p className={styles.subtitle}>
            Track financial records, patient invoices, and payment statuses.
          </p>
        </div>
        <div className={styles.actionButtons}>
          <button
            className={styles.addButton}
            onClick={() => setIsAddOpen(true)}
          >
            + Add Invoice
          </button>
          <button
            className={styles.exportButton}
            onClick={handleExportCSV}
            disabled={!filteredInvoices.length || loading}
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.metricsGrid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Collected Revenue</p>
          <h2 className={styles.revenueText}>${totalRevenue.toFixed(2)}</h2>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Outstanding Pending</p>
          <h2 className={styles.pendingText}>${pendingAmount.toFixed(2)}</h2>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>
            Invoices ({filteredInvoices.length})
          </span>
          <div className={styles.filterWrapper}>
            <label className={styles.filterLabel}>Filter Status:</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className={styles.message}>Loading billing records...</p>
        ) : filteredInvoices.length === 0 ? (
          <p className={styles.message}>No billing records found.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const invId = inv.id || inv._id;
                    const statusKey = inv.status?.toLowerCase() || "pending";
                    return (
                      <tr key={invId}>
                        <td className={styles.invoiceId}>
                          #{invId ? String(invId).slice(-6) : "N/A"}
                        </td>
                        <td>{inv.patient_name || "N/A"}</td>
                        <td className={styles.textMuted}>
                          {inv.doctor_name || "N/A"}
                        </td>
                        <td className={styles.amountText}>
                          ${Number(inv.amount || 0).toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${styles[statusKey]}`}
                          >
                            {inv.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className={styles.textMuted}>{inv.due_date || "N/A"}</td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button
                              className={styles.viewBtn}
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsPreviewOpen(true);
                              }}
                            >
                              View
                            </button>
                            <button
                              className={styles.upiBtn}
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsUpiModalOpen(true);
                              }}
                            >
                              UPI Pay
                            </button>
                            <button
                              className={styles.editBtn}
                              onClick={() => handleOpenEdit(inv)}
                            >
                              Edit
                            </button>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDelete(invId)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className={styles.mobileCardList}>
              {filteredInvoices.map((inv) => {
                const invId = inv.id || inv._id;
                const statusKey = inv.status?.toLowerCase() || "pending";
                return (
                  <div key={invId} className={styles.mobileCard}>
                    <div className={styles.mobileCardHeader}>
                      <div>
                        <strong>{inv.patient_name || "N/A"}</strong>
                        <div className={styles.previewMeta}>
                          #{invId ? String(invId).slice(-6) : "N/A"}
                        </div>
                      </div>
                      <span className={`${styles.badge} ${styles[statusKey]}`}>
                        {inv.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.mobileCardBody}>
                      <div><strong>Doctor:</strong> {inv.doctor_name || "N/A"}</div>
                      <div><strong>Amount:</strong> ${Number(inv.amount || 0).toFixed(2)}</div>
                      <div><strong>Due Date:</strong> {inv.due_date || "N/A"}</div>
                    </div>
                    <div className={styles.mobileCardActions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsPreviewOpen(true);
                        }}
                      >
                        View
                      </button>
                      <button
                        className={styles.upiBtn}
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsUpiModalOpen(true);
                        }}
                      >
                        UPI Pay
                      </button>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleOpenEdit(inv)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(invId)}
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

      {/* Add Invoice Modal */}
      {isAddOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Add New Invoice</h3>
            <form onSubmit={handleAddSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Patient Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={addForm.patient_name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, patient_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Doctor Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={addForm.doctor_name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, doctor_name: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className={styles.formInput}
                  value={addForm.amount}
                  onChange={(e) =>
                    setAddForm({ ...addForm, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formInput}
                  value={addForm.status}
                  onChange={(e) =>
                    setAddForm({ ...addForm, status: e.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Due Date</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={addForm.due_date}
                  onChange={(e) =>
                    setAddForm({ ...addForm, due_date: e.target.value })
                  }
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {isEditOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Edit Invoice</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Patient Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editForm.patient_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, patient_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Doctor Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editForm.doctor_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, doctor_name: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className={styles.formInput}
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formInput}
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Due Date</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={editForm.due_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, due_date: e.target.value })
                  }
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Invoice Modal */}
      {isPreviewOpen && selectedInvoice && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.previewModal}`}>
            <div className={styles.previewHeader}>
              <h3 className={styles.modalTitle}>Invoice Preview</h3>
              <button
                className={styles.closeIconBtn}
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.previewBody}>
              <div className={styles.previewTopRow}>
                <div>
                  <h2 className={styles.brandTitle}>MEDICAL CLINIC</h2>
                  <p className={styles.previewMeta}>
                    Invoice ID: #{selectedInvoice.id || selectedInvoice._id}
                  </p>
                  <p className={styles.previewMeta}>
                    Due Date: {selectedInvoice.due_date || "N/A"}
                  </p>
                </div>
                <div>
                  <span
                    className={`${styles.badge} ${
                      styles[selectedInvoice.status?.toLowerCase() || "pending"]
                    }`}
                  >
                    {selectedInvoice.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className={styles.previewInfoBox}>
                <p className={styles.previewInfoText}>
                  <strong>Patient:</strong> {selectedInvoice.patient_name}
                </p>
                <p className={styles.previewInfoText}>
                  <strong>Doctor:</strong> {selectedInvoice.doctor_name || "N/A"}
                </p>
              </div>

              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className={styles.textRight}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Medical Services Rendered</td>
                    <td className={styles.textRight}>
                      ${Number(selectedInvoice.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className={styles.previewTotalRow}>
                <span>Total Payable:</span>
                <strong>
                  ${Number(selectedInvoice.amount || 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.exportButton}
                onClick={() => handleExportPDF(selectedInvoice)}
              >
                Download PDF
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsPreviewOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Payment Modal */}
      {isUpiModalOpen && selectedInvoice && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.previewHeader}>
              <h3 className={styles.modalTitle}>UPI Payment QR Code</h3>
              <button
                className={styles.closeIconBtn}
                onClick={() => setIsUpiModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.upiBody}>
              <p className={styles.previewMeta}>
                Scan using Google Pay, PhonePe, or Paytm
              </p>
              <div className={styles.qrWrapper}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `upi://pay?pa=medcorehospital@upi&pn=MedCore%20HMS&am=${
                      selectedInvoice.amount || 0
                    }&cu=INR`
                  )}`}
                  alt="UPI QR Code"
                />
              </div>
              <div className={styles.previewInfoBox}>
                <p className={styles.previewInfoText}>
                  <strong>Patient:</strong> {selectedInvoice.patient_name}
                </p>
                <p className={styles.previewInfoText}>
                  <strong>Amount:</strong> $
                  {Number(selectedInvoice.amount || 0).toFixed(2)}
                </p>
                <p className={styles.previewInfoText}>
                  <strong>VPA:</strong> <code>medcorehospital@upi</code>
                </p>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsUpiModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}