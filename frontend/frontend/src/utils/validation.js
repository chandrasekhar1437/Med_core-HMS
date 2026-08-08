import React, { useState } from "react";
import { validatePatientInput } from "../utils/validators"; // Adjust path as needed
import API from "../services/api"; // Adjust or replace with your API handler

export default function PatientIntakeForm({ onPatientAdded }) {
  const initialFormState = {
    name: "",
    age: "",
    gender: "",
    contact: "",
    email: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    
    setFormData(updatedFormData);

    // Re-validate field in real time if it has already been interacted with
    if (touched[name]) {
      const { errors: currentErrors } = validatePatientInput(updatedFormData);
      setErrors((prev) => ({
        ...prev,
        [name]: currentErrors[name] || null,
      }));
    }
  };

  // Mark field as touched when user moves away
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Run validation for the blurred field
    const { errors: currentErrors } = validatePatientInput(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: currentErrors[name] || null,
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSubmitSuccess(false);

    // Mark all fields as touched to display any hidden errors
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Run full validation check
    const { isValid, errors: validationErrors } = validatePatientInput(formData);
    setErrors(validationErrors);

    if (!isValid) return;

    try {
      setIsSubmitting(true);
      
      // Example API call
      const response = await API.post("/patients/", formData);
      
      setSubmitSuccess(true);
      setFormData(initialFormState);
      setTouched({});
      setErrors({});

      if (onPatientAdded) {
        onPatientAdded(response.data);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setServerError(err.response?.data?.message || "Failed to register patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        padding: "24px",
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Patient Intake Form</h2>

      {submitSuccess && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#d4edda",
            color: "#155724",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          Patient successfully registered!
        </div>
      )}

      {serverError && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Patient Name */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Jane Doe"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: errors.name && touched.name ? "1px solid #dc3545" : "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          {errors.name && touched.name && (
            <span style={{ color: "#dc3545", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Age & Gender Row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
              Age *
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="32"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: errors.age && touched.age ? "1px solid #dc3545" : "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
            {errors.age && touched.age && (
              <span style={{ color: "#dc3545", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                {errors.age}
              </span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: errors.gender && touched.gender ? "1px solid #dc3545" : "1px solid #ccc",
                boxSizing: "border-box",
              }}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && touched.gender && (
              <span style={{ color: "#dc3545", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                {errors.gender}
              </span>
            )}
          </div>
        </div>

        {/* Contact Phone */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
            Contact Number *
          </label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="(555) 000-0000"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: errors.contact && touched.contact ? "1px solid #dc3545" : "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          {errors.contact && touched.contact && (
            <span style={{ color: "#dc3545", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
              {errors.contact}
            </span>
          )}
        </div>

        {/* Optional Email */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
            Email Address (Optional)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="patient@example.com"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: errors.email && touched.email ? "1px solid #dc3545" : "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          {errors.email && touched.email && (
            <span style={{ color: "#dc3545", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "10px 16px",
            backgroundColor: isSubmitting ? "#6c757d" : "#0d6efd",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Submitting..." : "Register Patient"}
        </button>
      </form>
    </div>
  );
}