import React, { useState, useEffect } from "react";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../services/appointmentApi";
import "./Appointments.css";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    patient_name: "",
    doctor_name: "",
    appointment_date: "",
    appointment_time: "",
    status: "Scheduled",
    reason: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatErrorMessage = (serverDetail) => {
    if (typeof serverDetail === "string") return serverDetail;
    if (Array.isArray(serverDetail)) {
      return serverDetail.map((err) => err.msg || err.detail).join(" | ");
    }
    return "Failed to communicate with backend server.";
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      const serverMsg = err.response?.data?.detail;
      setError(
        serverMsg
          ? formatErrorMessage(serverMsg)
          : "Failed to connect to backend server or fetch appointments."
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
      if (editingId) {
        await updateAppointment(editingId, form);
        setEditingId(null);
      } else {
        await createAppointment(form);
      }
      setForm({
        patient_name: "",
        doctor_name: "",
        appointment_date: "",
        appointment_time: "",
        status: "Scheduled",
        reason: "",
      });
      fetchAppointments();
    } catch (err) {
      console.error("Error saving appointment:", err);
      const serverMsg = err.response?.data?.detail;
      setError(
        serverMsg
          ? formatErrorMessage(serverMsg)
          : "Failed to save appointment. Please check form fields."
      );
    }
  };

  const handleEditClick = (appointment) => {
    const appId = appointment.id || appointment._id;
    setEditingId(appId);
    setForm({
      patient_name: appointment.patient_name || "",
      doctor_name: appointment.doctor_name || "",
      appointment_date: appointment.appointment_date || "",
      appointment_time: appointment.appointment_time || "",
      status: appointment.status || "Scheduled",
      reason: appointment.reason || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      patient_name: "",
      doctor_name: "",
      appointment_date: "",
      appointment_time: "",
      status: "Scheduled",
      reason: "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      fetchAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError("Failed to delete appointment.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return <span className="badge badge-completed">Completed</span>;
      case "Cancelled":
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="badge badge-scheduled">Scheduled</span>;
    }
  };

  return (
    <div className="appointments-container">
      <h2 className="appointments-header">Appointments Management</h2>

      {error && <div className="error-message">{error}</div>}

      {/* Appointment Form */}
      <div className="appointment-card-form">
        <h3 className="form-title">
          {editingId ? "Edit Appointment" : "Book New Appointment"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                name="patient_name"
                placeholder="Enter patient name"
                value={form.patient_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Doctor Name</label>
              <input
                type="text"
                name="doctor_name"
                placeholder="Enter doctor name"
                value={form.doctor_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Appointment Date</label>
              <input
                type="date"
                name="appointment_date"
                value={form.appointment_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Appointment Time</label>
              <input
                type="time"
                name="appointment_time"
                value={form.appointment_time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label>Reason for Visit</label>
              <input
                type="text"
                name="reason"
                placeholder="Checkup, Routine, etc."
                value={form.reason}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Appointment" : "Book Appointment"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table List */}
      <h3>Existing Appointments</h3>
      <div className="table-container">
        {loading ? (
          <div className="no-data">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="no-data">No appointments booked yet.</div>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => {
                const appId = app.id || app._id;
                return (
                  <tr key={appId}>
                    <td>
                      <strong>{app.patient_name}</strong>
                    </td>
                    <td>{app.doctor_name}</td>
                    <td>{app.appointment_date}</td>
                    <td>{app.appointment_time}</td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>{app.reason || "-"}</td>
                    <td>
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEditClick(app)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(appId)}
                      >
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