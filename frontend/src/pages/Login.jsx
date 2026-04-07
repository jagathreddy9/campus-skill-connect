import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ 
    role: 'Learner',
    collegeEmail: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { role, collegeEmail, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeEmail, password, role })
      });
      
      const contentType = res.headers.get('content-type');
      const data = (contentType && contentType.includes('application/json')) ? await res.json() : null;
      
      if (res.ok) {
        login(data.user, data.token);
        navigate('/dashboard'); 
      } else {
        setError(data?.msg || 'Login failed. Please check your credentials or try again later.');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setError('Cannot connect to server. Please try again soon.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>Skill Connect Welcome</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '16px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button"
            className={role === 'Learner' ? 'btn-primary' : 'btn-outline'} 
            style={{ flex: 1 }}
            onClick={() => setFormData({ ...formData, role: 'Learner' })}
          >Learner</button>
          <button 
            type="button"
            className={role === 'Tutor' ? 'btn-primary' : 'btn-outline'} 
            style={{ flex: 1 }}
            onClick={() => setFormData({ ...formData, role: 'Tutor' })}
          >Tutor</button>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="label">College Email ID</label>
            <input 
              type="email" 
              name="collegeEmail" 
              value={collegeEmail} 
              onChange={onChange} 
              className="input-field" 
              placeholder="you@College_name.ac.in" 
              required 
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label className="label">Password</label>
            <input 
              type="password" 
              name="password" 
              value={password} 
              onChange={onChange} 
              className="input-field" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login as {role}</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
