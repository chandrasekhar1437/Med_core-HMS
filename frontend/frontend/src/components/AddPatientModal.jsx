import React, { useState } from 'react';
import API from '../services/api';
import { validatePatientInput } from '../utils/validation';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

export default function AddPatientModal({ onClose, onPatientAdded }) {
  const { showNotification } = useNotification();
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validatePatientInput(formData);

    if (!isValid) {
      setErrors(validationErrors);
      showNotification('Please correct the highlighted errors.', 'error');
      return;
    }

    try {
      await API.post('/patients/', {
        ...formData,
        age: parseInt(formData.age, 10)
      });
      showNotification('Patient registered successfully!', 'success');
      onPatientAdded();
      onClose();
    } catch (err) {
      showNotification('Failed to register patient. Try again.', 'error');
    }
  };

  const modalBg = darkMode ? '#1f1f1f' : '#ffffff';
  const textColor = darkMode ? '#e0e0e0' : '#212529';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: modalBg, color: textColor, padding: '25px', borderRadius: '8px', width: '400px' }}>
        <h3>Register New Patient</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Full Name *</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange} style={inputStyle(errors.name)} />
            {errors.name && <span style={errorTextStyle}>{errors.name}</span>}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, marginBottom: '12px' }}>
              <label style={labelStyle}>Age *</label>
              <input name="age" type="number" value={formData.age} onChange={handleChange} style={inputStyle(errors.age)} />
              {errors.age && <span style={errorTextStyle}>{errors.age}</span>}
            </div>

            <div style={{ flex: 1, marginBottom: '12px' }}>
              <label style={labelStyle}>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle(errors.gender)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Contact Number *</label>
            <input name="contact" type="text" placeholder="e.g. 555-0199" value={formData.contact} onChange={handleChange} style={inputStyle(errors.contact)} />
            {errors.contact && <span style={errorTextStyle}>{errors.contact}</span>}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Email Address</label>
            <input name="email" type="email" placeholder="patient@email.com" value={formData.email} onChange={handleChange} style={inputStyle(errors.email)} />
            {errors.email && <span style={errorTextStyle}>{errors.email}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' };
const errorTextStyle = { color: '#dc3545', fontSize: '11px', marginTop: '2px', display: 'block' };
const inputStyle = (hasError) => ({
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: hasError ? '1px solid #dc3545' : '1px solid #ccc',
  boxSizing: 'border-box'
});