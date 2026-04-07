import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
        <img src={logo} alt="Campus Skill Connect" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
        <span style={{ background: 'linear-gradient(45deg, #f8fafc, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillConnect</span>
      </Link>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/dashboard" style={{ color: 'var(--color-text-primary)' }}>Dashboard</Link>
            <Link to="/complete-profile" style={{ color: 'var(--color-text-primary)' }}>Edit Profile</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
              <User size={20} />
              <span>{user.fullName} ({user.role})</span>
            </div>
            <button onClick={handleLogout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-outline">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
