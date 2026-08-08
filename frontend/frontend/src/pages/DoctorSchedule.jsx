import { useState, useEffect } from "react";
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
      setSchedule(response.data);
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
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">DOCTOR MANAGEMENT</p>
          <h1>Doctor Schedule</h1>
          <p>Manage consultation availability and working hours.</p>
        </div>
      </section>

      {error && (
        <div style={{ color: "red", padding: "0 2rem 1rem" }}>
          {error}
        </div>
      )}

      <section className="dashboard-grid">
        <article className="form-card">
          <h2>Add Available Time</h2>

          <form className="form-grid single-column" onSubmit={addSchedule}>
            <label>
              Day
              <select
                value={form.day}
                onChange={(event) =>
                  setForm({
                    ...form,
                    day: event.target.value,
                  })
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
                  setForm({
                    ...form,
                    start: event.target.value,
                  })
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
                  setForm({
                    ...form,
                    end: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Department
              <input
                value={form.department}
                onChange={(event) =>
                  setForm({
                    ...form,
                    department: event.target.value,
                  })
                }
                required
              />
            </label>

            <button className="primary-button">Add Schedule</button>
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
              <p style={{ padding: "1rem" }}>Loading schedule...</p>
            ) : schedule.length > 0 ? (
              schedule.map((item) => (
                <div className="schedule-row" key={item.id || item._id}>
                  <div>
                    <strong>{item.day}</strong>
                    <span>{item.department}</span>
                  </div>

                  <b>
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
              <p style={{ padding: "1rem" }}>No schedule slots found.</p>
            )}
          </div>
        </article>
      </section>
    </>
  );
}