import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    role: 'Patient' 
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    const cleanEmail = form.email.toLowerCase().trim();
    const cleanPassword = form.password.trim();

    try {
      if (isLogin) {
        // --- LOGIN ---
        const response = await API.post('/auth/login', {
          email: cleanEmail,
          password: cleanPassword,
          role: form.role,
        });

        const { access_token, user } = response.data;
        localStorage.setItem('token', access_token);
        if (user) localStorage.setItem('user', JSON.stringify(user));

        setMessage('Logged in successfully!');
        setTimeout(() => navigate('/'), 1000);
      } else {
        // --- REGISTER ---
        const payload = {
          name: form.name.trim(),
          full_name: form.name.trim(),
          email: cleanEmail,
          password: cleanPassword,
          role: form.role,
        };

        const response = await API.post('/auth/register', payload);
        const { access_token, user } = response.data;

        localStorage.setItem('token', access_token);
        if (user) localStorage.setItem('user', JSON.stringify(user));

        setMessage(`Account created successfully for ${form.name}!`);
        setTimeout(() => navigate('/'), 1000);
      }
      setForm({ email: '', password: '', name: '', role: 'Patient' });
    } catch (err) {
      console.error('Auth error:', err);
      setIsError(true);
      const serverMsg = err.response?.data?.detail;
      
      if (Array.isArray(serverMsg)) {
        setMessage(serverMsg[0]?.msg || 'Validation error.');
      } else if (typeof serverMsg === 'string') {
        setMessage(serverMsg);
      } else {
        setMessage('Authentication failed. Check your network or credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        
        <div style={styles.header}>
          <h2 style={styles.title}>
            {isLogin ? 'Login to Hospital App' : 'Register New Account'}
          </h2>
          <p style={styles.subtitle}>
            {isLogin 
              ? 'Enter your details to access your portal' 
              : 'Fill in the information below to get started'}
          </p>
        </div>

        {message && (
          <div style={{
            ...styles.alertBanner,
            ...(isError ? styles.errorAlert : styles.successAlert)
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} autoCapitalize="none" autoCorrect="off" style={styles.form}>
          
          {/* Account Role Dropdown */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Select Role</label>
            <select 
              value={form.role} 
              onChange={e => setForm({...form, role: e.target.value})}
              style={styles.selectInput}
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
              <option value="Staff">Medical Staff / Nurse</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>

          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input 
                type="text" 
                placeholder="Dr. John Doe" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                style={styles.input} 
                required 
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="user@medcore.com" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              style={styles.input} 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              style={styles.input} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.btnDisabled : {})
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p style={styles.footerText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setMessage(''); setIsError(false); }} 
            style={styles.toggleLink}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>

      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
    padding: '20px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '36px 32px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 6px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
  },
  alertBanner: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: '1.4',
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  selectInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.2s ease',
  },
  btnDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#64748b',
    margin: '24px 0 0 0',
  },
  toggleLink: {
    color: '#0284c7',
    cursor: 'pointer',
    fontWeight: '600',
  },
};