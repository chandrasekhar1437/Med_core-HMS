import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    patientCount: 0,
    doctorCount: 0,
    appointmentCount: 0,
    totalRevenue: 0,
    pendingInvoices: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pRes, dRes, aRes, bRes] = await Promise.all([
          API.get('/patients/'),
          API.get('/doctors/'),
          API.get('/appointments/'),
          API.get('/billing/')
        ]);

        const totalRev = bRes.data
          .filter(inv => inv.status === 'Paid')
          .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

        const pending = bRes.data.filter(inv => inv.status === 'Pending').length;

        setStats({
          patientCount: pRes.data.length,
          doctorCount: dRes.data.length,
          appointmentCount: aRes.data.length,
          totalRevenue: totalRev,
          pendingInvoices: pending
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '20px' }}>Hospital Performance Overview</h2>

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={cardStyle('#007bff')}>
          <h4 style={cardHeaderStyle}>Total Patients</h4>
          <p style={cardValueStyle}>{stats.patientCount}</p>
        </div>

        <div style={cardStyle('#28a745')}>
          <h4 style={cardHeaderStyle}>Active Doctors</h4>
          <p style={cardValueStyle}>{stats.doctorCount}</p>
        </div>

        <div style={cardStyle('#ffc107')}>
          <h4 style={cardHeaderStyle}>Appointments</h4>
          <p style={cardValueStyle}>{stats.appointmentCount}</p>
        </div>

        <div style={cardStyle('#17a2b8')}>
          <h4 style={cardHeaderStyle}>Total Revenue</h4>
          <p style={cardValueStyle}>${stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div style={cardStyle('#dc3545')}>
          <h4 style={cardHeaderStyle}>Pending Invoices</h4>
          <p style={cardValueStyle}>{stats.pendingInvoices}</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = (borderColor) => ({
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: `6px solid ${borderColor}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
});

const cardHeaderStyle = { margin: '0 0 10px 0', color: '#6c757d', fontSize: '14px' };
const cardValueStyle = { margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#212529' };