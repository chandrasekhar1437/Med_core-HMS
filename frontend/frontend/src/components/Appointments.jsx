import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const initialAppointments = [
  {
    id: 1,
    patient: "Rahul Kumar",
    doctor: "Dr. Ananya Reddy",
    department: "Cardiology",
    date: "2026-08-06",
    time: "09:30",
    status: "Scheduled",
  },
  {
    id: 2,
    patient: "Priya Sharma",
    doctor: "Dr. Vikram Verma",
    department: "Pediatrics",
    date: "2026-08-06",
    time: "10:15",
    status: "Confirmed",
  },
  {
    id: 3,
    patient: "Arjun Reddy",
    doctor: "Dr. Priya Sundaram",
    department: "Dermatology",
    date: "2026-08-06",
    time: "11:00",
    status: "Completed",
  },
];

const emptyForm = {
  patient: "",
  doctor: "",
  department: "",
  date: "",
  time: "",
  status: "Scheduled",
};

export default function Appointments() {
  const { role, user } = useAuth();

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem("healthmanager_appointments");

    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "healthmanager_appointments",
      JSON.stringify(appointments)
    );
  }, [appointments]);

  const visibleAppointments = useMemo(() => {
    const term = search.toLowerCase();

    return appointments.filter((item) => {
      const matchesSearch =
        item.patient.toLowerCase().includes(term) ||
        item.doctor.toLowerCase().includes(term) ||
        item.department.toLowerCase().includes(term);

      if (role === "Patient") {
        return (
          matchesSearch &&
          (item.patient === user.name ||
            item.patient === "Rahul Kumar")
        );
      }

      if (role === "Doctor") {
        return (
          matchesSearch &&
          item.doctor === "Dr. Ananya Reddy"
        );
      }

      return matchesSearch;
    });
  }, [appointments, role, search, user.name]);

  const saveAppointment = (event) => {
    event.preventDefault();

    if (editingId) {
      setAppointments((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
              }
            : item
        )
      );
    } else {
      setAppointments((current) => [
        ...current,
        {
          id: Date.now(),
          ...form,
          patient:
            role === "Patient"
              ? user.name
              : form.patient,
        },
      ]);
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const editAppointment = (item) => {
    setForm({
      patient: item.patient,
      doctor: item.doctor,
      department: item.department,
      date: item.date,
      time: item.time,
      status: item.status,
    });

    setEditingId(item.id);
    setShowForm(true);
  };

  const deleteAppointment = (id) => {
    if (window.confirm("Delete this appointment?")) {
      setAppointments((current) =>
        current.filter((item) => item.id !== id)
      );
    }
  };

  const updateStatus = (id, status) => {
    setAppointments((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item
      )
    );
  };

  const canManage =
    role === "Administrator" ||
    role === "Receptionist";

  const canAdd =
    canManage || role === "Patient";

  return (
    <>
      <section className="page-heading page-heading-action">
        <div>
          <p className="eyebrow">APPOINTMENT MANAGEMENT</p>
          <h1>Appointments</h1>
          <p>
            Schedule, edit, manage, and track patient appointments.
          </p>
        </div>

        {canAdd && (
          <button
            className="primary-button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setShowForm(true);
            }}
          >
            + New Appointment
          </button>
        )}
      </section>

      {showForm && (
        <section className="form-card">
          <div className="panel-header">
            <div>
              <h2>
                {editingId
                  ? "Edit Appointment"
                  : "New Appointment"}
              </h2>
              <p>Enter appointment information.</p>
            </div>

            <button
              className="icon-button"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
          </div>

          <form
            className="form-grid"
            onSubmit={saveAppointment}
          >
            {role !== "Patient" && (
              <label>
                Patient
                <input
                  required
                  value={form.patient}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      patient: event.target.value,
                    })
                  }
                  placeholder="Patient name"
                />
              </label>
            )}

            <label>
              Doctor
              <input
                required
                value={form.doctor}
                onChange={(event) =>
                  setForm({
                    ...form,
                    doctor: event.target.value,
                  })
                }
                placeholder="Doctor name"
              />
            </label>

            <label>
              Department
              <input
                required
                value={form.department}
                onChange={(event) =>
                  setForm({
                    ...form,
                    department: event.target.value,
                  })
                }
                placeholder="Department"
              />
            </label>

            <label>
              Date
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    date: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Time
              <input
                required
                type="time"
                value={form.time}
                onChange={(event) =>
                  setForm({
                    ...form,
                    time: event.target.value,
                  })
                }
              />
            </label>

            {role !== "Patient" && (
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value,
                    })
                  }
                >
                  <option>Scheduled</option>
                  <option>Confirmed</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </label>
            )}

            <div className="form-actions">
              <button className="primary-button">
                {editingId
                  ? "Update Appointment"
                  : "Save Appointment"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="table-toolbar">
          <div>
            <h2>Appointment List</h2>
            <p>{visibleAppointments.length} appointments found</p>
          </div>

          <input
            className="search-input"
            placeholder="Search patient, doctor..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date & Time</th>
                <th>Status</th>
                {(canManage || role === "Doctor") && (
                  <th>Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {visibleAppointments.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.patient}</strong>
                  </td>

                  <td>{item.doctor}</td>
                  <td>{item.department}</td>

                  <td>
                    {item.date}
                    <br />
                    <span className="muted">
                      {item.time}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status ${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {(canManage || role === "Doctor") && (
                    <td>
                      <div className="action-buttons">
                        {role === "Doctor" && (
                          <select
                            value={item.status}
                            onChange={(event) =>
                              updateStatus(
                                item.id,
                                event.target.value
                              )
                            }
                          >
                            <option>Scheduled</option>
                            <option>Confirmed</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                          </select>
                        )}

                        {canManage && (
                          <>
                            <button
                              className="small-button"
                              onClick={() =>
                                editAppointment(item)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="small-button danger"
                              onClick={() =>
                                deleteAppointment(item.id)
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {visibleAppointments.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-cell"
                  >
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}