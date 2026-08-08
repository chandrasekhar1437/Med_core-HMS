import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export default function PatientDetailsModal({ patient, onClose }) {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { darkMode } = useTheme();
  const { showNotification } = useNotification();

  const [bookingData, setBookingData] = useState({
    doctor_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [appRes, recRes, docRes] = await Promise.all([
        API.get(`/appointments/?patient_id=${patient.id}`),
        API.get(`/medical-records/?patient_id=${patient.id}`),
        API.get('/doctors/')
      ]);
      setAppointments(appRes.data);
      setRecords(recRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error('Error loading patient history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patient?.id) fetchPatientData();
  }, [patient]);

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    if (!bookingData.doctor_id) {
      showNotification('Please select a doctor.', 'error');
      return;
    }

    try {
      await API.post('/appointments/', {
        patient_id: patient.id,
        doctor_id: bookingData.doctor_id,
        appointment_date: bookingData.appointment_date,
        reason: bookingData.reason,
        status: 'Scheduled'
      });
      showNotification('Appointment scheduled successfully!', 'success');
      setShowBookingForm(false);
      setBookingData({ doctor_id: '', appointment_date: new Date().toISOString().split('T')[0], reason: '' });
      fetchPatientData();
    } catch (err) {
      showNotification('Failed to schedule appointment.', 'error');
    }
  };

  if (!patient) return null;

  const modalBg = darkMode ? '#1f1f1f' : '#ffffff';
  const textColor = darkMode ? '#e0e0e0' : '#212529';
  const borderColor = darkMode ? '#333' : '#dee2e6';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: modalBg, color: textColor, padding: '25px', borderRadius: '8px', width: '620px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${borderColor}`, paddingBottom: '10px', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#007bff' }}>Patient Medical Summary</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: textColor, fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>

        {/* Profile Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
          <div><strong>Name:</strong> {patient.name}</div>
          <div><strong>Age / Gender:</strong> {patient.age} / {patient.gender}</div>
          <div><strong>Contact:</strong> {patient.contact}</div>
          <div><strong>Email:</strong> {patient.email || 'N/A'}</div>
        </div>

        {loading ? (
          <p>Loading details...</p>
        ) : (
          <>
            {/* Quick Booking Action Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, color: '#17a2b8' }}>📅 Appointment History</h4>
              <button 
                onClick={() => setShowBookingForm(!showBookingForm)} 
                style={{ padding: '4px 10px', backgroundColor: showBookingForm ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                {showBookingForm ? 'Cancel' : '+ Quick Schedule'}
              </button>
            </div>

            {/* Quick Appointment Form */}
            {showBookingForm && (
              <form onSubmit={handleScheduleAppointment} style={{ backgroundColor: darkMode ? '#2d2d2d' : '#eef2f5', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <select required value={bookingData.doctor_id} onChange={e => setBookingData({...bookingData, doctor_id: e.target.value})} style={selectStyle}>
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization || 'General'})</option>)}
                  </select>
                  <input type="date" required value={bookingData.appointment_date} onChange={e => setBookingData({...bookingData, appointment_date: e.target.value})} style={inputStyle} />
                </div>
                <input type="text" placeholder="Reason for consultation..." value={bookingData.reason} onChange={e => setBookingData({...bookingData, reason: e.target.value})} style={{ ...inputStyle, width: '100%', marginBottom: '8px', boxSizing: 'border-box' }} />
                <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', width: '100%' }}>
                  Confirm Booking
                </button>
              </form>
            )}

            {/* Appointments List */}
            <div style={{ marginBottom: '20px' }}>
              {appointments.length > 0 ? (
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {appointments.map((app, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>
                      <strong>{app.appointment_date}</strong> - {app.doctor_name || 'Doctor'} ({app.status})
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '13px', color: '#6c757d' }}>No past appointments recorded.</p>
              )}
            </div>

            {/* Medical Records */}
            <h4 style={{ marginBottom: '10px', color: '#28a745' }}>💊 Medical Records & Prescriptions</h4>
            <div>
              {records.length > 0 ? (
                records.map((rec, i) => (
                  <div key={i} style={{ borderLeft: '3px solid #28a745', paddingLeft: '10px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>{rec.record_date}</div>
                    <div><strong>Diagnosis:</strong> {rec.diagnosis}</div>
                    <div><strong>Prescription:</strong> {rec.prescription || 'None'}</div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: '#6c757d' }}>No medical records logged.</p>
              )}
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { padding: '6px', borderRadius: '4px', border: '1px solid #ccc' };
const selectStyle = { flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc' };