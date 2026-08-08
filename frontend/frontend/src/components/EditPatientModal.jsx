import { useEffect, useState } from "react";

export default function EditPatientModal({
  patient,
  onClose,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
    email: "",
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || "",
        age: patient.age || "",
        gender: patient.gender || "",
        contact: patient.contact || "",
        email: patient.email || "",
      });
    }
  }, [patient]);

  if (!patient) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await onUpdate({
        ...patient,
        ...formData,
        age: Number(formData.age),
      });

      onClose();
    } catch (error) {
      console.error("Unable to update patient:", error);
      alert("Unable to update patient.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="patient-modal">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <h2>Edit Patient</h2>

        <p className="modal-description">
          Update the patient information below.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="patient-name">
              Patient Name
            </label>

            <input
              id="patient-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="patient-age">
              Age
            </label>

            <input
              id="patient-age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="150"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="patient-gender">
              Gender
            </label>

            <select
              id="patient-gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="patient-contact">
              Contact Number
            </label>

            <input
              id="patient-contact"
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="patient-email">
              Email
            </label>

            <input
              id="patient-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="update-button"
            >
              Update Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}