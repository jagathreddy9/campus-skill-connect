import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    role: 'Learner',
    fullName: '',
    collegeEmail: '',
    password: '',
    confirmPassword: '',
    phone: '+91 ',
    gender: 'Other'
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { role, fullName, collegeEmail, password, confirmPassword, phone, gender } = formData;

  const onChange = e => {
    if (e.target.name === 'phone') {
      let val = e.target.value;
      if (!val.startsWith('+91 ')) val = '+91 ';
      setFormData({ ...formData, phone: val });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return setError('Password must be 8 to 16 characters and include at least one letter and one number.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.ac\.in$/;
    if (!emailRegex.test(collegeEmail)) {
      return setError('Email must strictly be in the format: you@College_name.ac.in');
    }
    setError('');

    try {
      const payload = { ...formData };
      delete payload.confirmPassword;

      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const contentType = res.headers.get('content-type');
      const data = (contentType && contentType.includes('application/json')) ? await res.json() : null;
      
      if (res.ok) {
        // Direct completely into dashboard with context, bypassing OTP step
        login(data.user, data.token);
        navigate('/dashboard'); 
      } else {
        setError(data?.msg || 'Registration failed. Please check your information or try again later.');
      }
    } catch (err) {
      console.error('Register submit error:', err);
      setError('Cannot connect to server. Please try again soon.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', padding: '40px 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>
          Create Account
        </h2>
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
            <label className="label">Full Name</label>
            <input type="text" name="fullName" value={fullName} onChange={onChange} className="input-field" required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label className="label">College Email ID</label>
            <input type="email" name="collegeEmail" value={collegeEmail} onChange={onChange} className="input-field" placeholder="you@College_name.ac.in" required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="label">Password (8-16 chars)</label>
              <input type="password" name="password" value={password} onChange={onChange} className="input-field" required minLength="8" maxLength="16" />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} className="input-field" required minLength="8" maxLength="16" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label className="label">Phone Number</label>
              <input type="text" name="phone" value={phone} onChange={onChange} className="input-field" required />
            </div>
            <div>
              <label className="label">Gender</label>
              <select name="gender" value={gender} onChange={onChange} className="input-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Register & Continue</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
