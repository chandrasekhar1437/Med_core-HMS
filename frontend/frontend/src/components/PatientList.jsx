import { useMemo, useState } from "react";

const initialPatients = [
  {
    id: 1,
    name: "Ananya Reddy",
    age: 29,
    gender: "Female",
    phone: "+91 9876543211",
    email: "ananya.reddy@example.com",
    status: "Active",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    age: 42,
    gender: "Male",
    phone: "+91 9876543212",
    email: "rahul.sharma@example.com",
    status: "Active",
  },
  {
    id: 3,
    name: "Priya Sundaram",
    age: 35,
    gender: "Female",
    phone: "+91 9876543213",
    email: "priya.sundaram@example.com",
    status: "Active",
  },
  {
    id: 4,
    name: "Vikram Verma",
    age: 51,
    gender: "Male",
    phone: "+91 9876543214",
    email: "vikram.verma@example.com",
    status: "Inactive",
  },
];

const emptyPatient = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  email: "",
  status: "Active",
};

function PatientList() {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyPatient);

  const filteredPatients = useMemo(() => {
    const value = search.toLowerCase();

    return patients.filter((patient) =>
      `${patient.name} ${patient.email} ${patient.phone}`
        .toLowerCase()
        .includes(value)
    );
  }, [patients, search]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyPatient);
    setShowForm(true);
  }

  function openEditForm(patient) {
    setEditingId(patient.id);
    setForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      status: patient.status,
    });
    setShowForm(true);
  }

  function savePatient(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      alert("Please enter patient name and email.");
      return;
    }

    if (editingId) {
      setPatients((current) =>
        current.map((patient) =>
          patient.id === editingId
            ? {
                ...patient,
                ...form,
                age: Number(form.age),
              }
            : patient
        )
      );
    } else {
      setPatients((current) => [
        {
          id: Date.now(),
          ...form,
          age: Number(form.age),
        },
        ...current,
      ]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyPatient);
  }

  function deletePatient(id, name) {
    const confirmed = window.confirm(
      `Delete patient "${name}"?`
    );

    if (!confirmed) return;

    setPatients((current) =>
      current.filter((patient) => patient.id !== id)
    );
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PATIENT MANAGEMENT</p>
          <h1>Patient List</h1>
          <p>View, add, edit, and delete patient information.</p>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          + Add Patient
        </button>
      </div>

      <section className="panel">
        <div className="table-toolbar">
          <div>
            <h2>All Patients</h2>
            <p>{patients.length} patient records</p>
          </div>

          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patients..."
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Status</th>
                <th className="action-column">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="person-cell">
                      <div className="person-avatar">
                        {patient.name.charAt(0)}
                      </div>

                      <div>
                        <strong>{patient.name}</strong>
                        <small>{patient.email}</small>
                      </div>
                    </div>
                  </td>

                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.phone}</td>

                  <td>
                    <span
                      className={`status ${
                        patient.status === "Active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => openEditForm(patient)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deletePatient(
                            patient.id,
                            patient.name
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={savePatient}>
            <div className="modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit Patient"
                    : "Add Patient"}
                </h2>

                <p>
                  Enter the patient information below.
                </p>
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
                Full Name
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter full name"
                />
              </label>

              <label>
                Age
                <input
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      age: event.target.value,
                    })
                  }
                  placeholder="Age"
                />
              </label>

              <label>
                Gender
                <select
                  value={form.gender}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      gender: event.target.value,
                    })
                  }
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
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
                  placeholder="+91 9876543210"
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
                  placeholder="patient@email.com"
                />
              </label>

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
                  <option>Active</option>
                  <option>Inactive</option>
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
                  : "Add Patient"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default PatientList;