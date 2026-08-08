import React, { useState } from 'react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      setMessage(`Logged in successfully with ${form.email}!`);
    } else {
      setMessage(`Account created successfully for ${form.name}!`);
    }
    setForm({ email: '', password: '', name: '' });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '30px', background: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '1px solid #e1e8ed' }}>
        
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50' }}>
          {isLogin ? 'Login to Hospital App' : 'Register New Account'}
        </h2>

        {message && (
          <div style={{ marginBottom: '15px', padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
          
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} 
              required 
            />
          )}

          <input 
            type="email" 
            placeholder="Email Address" 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} 
            required 
          />

          <input 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={e => setForm({...form, password: e.target.value})} 
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} 
            required 
          />

          <button 
            type="submit" 
            style={{ backgroundColor: '#007BFF', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setMessage(''); }} 
            style={{ color: '#007BFF', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>

      </div>
    </div>
  );
}