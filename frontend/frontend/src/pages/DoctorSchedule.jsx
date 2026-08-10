import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function DoctorSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    day: "Monday",
    start: "09:00",
    end: "17:00",
    department: "Cardiology",
  });

  // Fetch schedules from FastAPI backend
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get("/schedules/");
      setSchedule(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("Failed to load doctor schedules from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Add new schedule via POST request
  const addSchedule = async (event) => {
    event.preventDefault();

    try {
      await api.post("/schedules/", form);
      fetchSchedules(); // Refresh schedule list after saving
    } catch (err) {
      console.error("Error adding schedule:", err);
      alert("Failed to save schedule record.");
    }
  };

  // Remove schedule via DELETE request
  const removeSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to remove this schedule slot?")) return;

    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch (err) {
      console.error("Error removing schedule:", err);
      alert("Failed to delete schedule slot.");
    }
  };

  return (
    <div className="schedule-container">
      <style>
        {`
          .schedule-container {
            padding: 24px;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            box-sizing: border-box;
          }

          .page-heading {
            margin-bottom: 24px;
          }

          .eyebrow {
            font-size: 12px;
            font-weight: 700;
            color: #0284c7;
            margin: 0 0 4px 0;
            letter-spacing: 0.5px;
          }

          .page-heading h1 {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 6px 0;
          }

          .page-heading p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }

          .error-banner {
            color: #b91c1c;
            background-color: #fee2e2;
            border: 1px solid #fca5a5;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
          }

          .schedule-grid-layout {
            display: grid;
            grid-template-columns: 320px 1fr;
            gap: 24px;
            align-items: start;
          }

          .form-card, .panel {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            box-sizing: border-box;
          }

          .form-card h2, .panel-header h2 {
            font-size: 18px;
            color: #0f172a;
            margin: 0 0 16px 0;
          }

          .schedule-form {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .schedule-form label {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
            color: #334155;
          }

          .schedule-form input, .schedule-form select {
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            background-color: #ffffff;
            box-sizing: border-box;
            width: 100%;
          }

          .primary-button {
            background-color: #0284c7;
            color: #ffffff;
            border: none;
            padding: 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            margin-top: 6px;
          }

          .panel-header {
            margin-bottom: 16px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 12px;
          }

          .panel-header p {
            margin: 0;
            font-size: 13px;
            color: #64748b;
          }

          .schedule-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .schedule-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 14px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            gap: 12px;
            flex-wrap: wrap;
          }

          .schedule-info {
            display: flex;
            flex-direction: column;
          }

          .schedule-info strong {
            font-size: 15px;
            color: #0f172a;
          }

          .schedule-info span {
            font-size: 13px;
            color: #64748b;
          }

          .schedule-time {
            font-size: 14px;
            color: #0284c7;
            font-weight: 600;
          }

          .small-button.danger {
            background-color: #ef4444;
            color: #ffffff;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }

          @media (max-width: 768px) {
            .schedule-container {
              padding: 16px;
            }

            .schedule-grid-layout {
              grid-template-columns: 1fr;
            }

            .schedule-row {
              flex-direction: column;
              align-items: flex-start;
            }

            .small-button.danger {
              width: 100%;
              text-align: center;
            }
          }
        `}
      </style>

      <section className="page-heading">
        <div>
          <p className="eyebrow">DOCTOR MANAGEMENT</p>
          <h1>Doctor Schedule</h1>
          <p>Manage consultation availability and working hours.</p>
        </div>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <div className="schedule-grid-layout">
        <article className="form-card">
          <h2>Add Available Time</h2>

          <form className="schedule-form" onSubmit={addSchedule}>
            <label>
              Day
              <select
                value={form.day}
                onChange={(event) =>
                  setForm({ ...form, day: event.target.value })
                }
              >
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </label>

            <label>
              Start Time
              <input
                type="time"
                value={form.start}
                onChange={(event) =>
                  setForm({ ...form, start: event.target.value })
                }
                required
              />
            </label>

            <label>
              End Time
              <input
                type="time"
                value={form.end}
                onChange={(event) =>
                  setForm({ ...form, end: event.target.value })
                }
                required
              />
            </label>

            <label>
              Department
              <input
                type="text"
                value={form.department}
                onChange={(event) =>
                  setForm({ ...form, department: event.target.value })
                }
                required
              />
            </label>

            <button type="submit" className="primary-button">
              Add Schedule
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Weekly Availability</h2>
              <p>Current consultation hours</p>
            </div>
          </div>

          <div className="schedule-list">
            {loading ? (
              <p style={{ padding: "12px", color: "#64748b" }}>Loading schedule...</p>
            ) : schedule.length > 0 ? (
              schedule.map((item) => (
                <div className="schedule-row" key={item.id || item._id}>
                  <div className="schedule-info">
                    <strong>{item.day}</strong>
                    <span>{item.department}</span>
                  </div>

                  <b className="schedule-time">
                    {item.start} – {item.end}
                  </b>

                  <button
                    className="small-button danger"
                    onClick={() => removeSchedule(item.id || item._id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p style={{ padding: "12px", color: "#64748b" }}>
                No schedule slots found.
              </p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}