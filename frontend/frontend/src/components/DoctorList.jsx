import { useMemo, useState } from "react";

const initialDoctors = [
  {
    id: 1,
    name: "Dr. Ananya Reddy",
    specialization: "Cardiology",
    phone: "+91 9876543211",
    email: "ananya.reddy@medcore.com",
    availability: "Available",
  },
  {
    id: 2,
    name: "Dr. Vikram Verma",
    specialization: "Pediatrics",
    phone: "+91 9876543212",
    email: "vikram.verma@medcore.com",
    availability: "Available",
  },
  {
    id: 3,
    name: "Dr. Priya Sundaram",
    specialization: "Dermatology",
    phone: "+91 9876543213",
    email: "priya.sundaram@medcore.com",
    availability: "Busy",
  },
  {
    id: 4,
    name: "Dr. Amitav Ghosh",
    specialization: "Neurology",
    phone: "+91 9876543214",
    email: "amitav.ghosh@medcore.com",
    availability: "Unavailable",
  },
];

const emptyDoctor = {
  name: "",
  specialization: "",
  phone: "",
  email: "",
  availability: "Available",
};

function DoctorList() {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyDoctor);

  const filteredDoctors = useMemo(() => {
    const value = search.toLowerCase();

    return doctors.filter((doctor) =>
      `${doctor.name} ${doctor.specialization} ${doctor.email}`
        .toLowerCase()
        .includes(value)
    );
  }, [doctors, search]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyDoctor);
    setShowForm(true);
  }

  function openEditForm(doctor) {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      phone: doctor.phone,
      email: doctor.email,
      availability: doctor.availability,
    });
    setShowForm(true);
  }

  function saveDoctor(event) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.specialization.trim()
    ) {
      alert("Enter doctor name and specialization.");
      return;
    }

    if (editingId) {
      setDoctors((current) =>
        current.map((doctor) =>
          doctor.id === editingId
            ? { ...doctor, ...form }
            : doctor
        )
      );
    } else {
      setDoctors((current) => [
        {
          id: Date.now(),
          ...form,
        },
        ...current,
      ]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyDoctor);
  }

  function deleteDoctor(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) {
      return;
    }

    setDoctors((current) =>
      current.filter((doctor) => doctor.id !== id)
    );
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DOCTOR MANAGEMENT</p>
          <h1>Doctors</h1>
          <p>Manage doctor profiles and availability.</p>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          + Add Doctor
        </button>
      </div>

      <section className="panel">
        <div className="table-toolbar">
          <div>
            <h2>Doctor Directory</h2>
            <p>{doctors.length} doctors registered</p>
          </div>

          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search doctors..."
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Contact</th>
                <th>Availability</th>
                <th className="action-column">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>
                    <div className="person-cell">
                      <div className="person-avatar doctor-avatar">
                        {doctor.name
                          .replace("Dr. ", "")
                          .charAt(0)}
                      </div>

                      <div>
                        <strong>{doctor.name}</strong>
                        <small>{doctor.email}</small>
                      </div>
                    </div>
                  </td>

                  <td>{doctor.specialization}</td>
                  <td>{doctor.phone}</td>

                  <td>
                    <span
                      className={`status ${
                        doctor.availability ===
                        "Available"
                          ? "status-active"
                          : doctor.availability ===
                            "Busy"
                          ? "status-busy"
                          : "status-inactive"
                      }`}
                    >
                      {doctor.availability}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() =>
                          openEditForm(doctor)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteDoctor(
                            doctor.id,
                            doctor.name
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No doctors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={saveDoctor}>
            <div className="modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit Doctor"
                    : "Add Doctor"}
                </h2>

                <p>Enter doctor information.</p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <div className="form-grid">
              <label>
                Doctor Name
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Dr. Name"
                />
              </label>

              <label>
                Specialization
                <input
                  value={form.specialization}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      specialization:
                        event.target.value,
                    })
                  }
                  placeholder="Cardiology"
                />
              </label>

              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      phone: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Availability
                <select
                  value={form.availability}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      availability:
                        event.target.value,
                    })
                  }
                >
                  <option>Available</option>
                  <option>Busy</option>
                  <option>Unavailable</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                {editingId
                  ? "Save Changes"
                  : "Add Doctor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default DoctorList;