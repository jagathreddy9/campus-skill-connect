import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, Star, Clock, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [tutors, setTutors] = useState([]);
  const [searchSkill, setSearchSkill] = useState('');
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    if (user?.role === 'Learner') {
      fetchTutors();
    }
    if (user) {
      fetchRequests();
      fetchSessions();
    }
  }, [user]);

  const fetchTutors = async (skill = '') => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/tutors?skill=${skill}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTutors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTutors(searchSkill);
  };

  const handleRequestStatus = async (requestId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRequests();
        fetchSessions(); // Acceptance creates a session
      } else {
        const errorData = await res.json();
        alert(errorData.msg || 'Failed to update request status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkCompleted = async (sessionId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getDisplayCollege = () => {
    if (user?.collegeName) return user.collegeName;
    if (user?.collegeEmail) {
      try { return user.collegeEmail.split('@')[1].split('.')[0].toUpperCase(); } catch (e) {}
    }
    return 'Campus';
  };
  const displayCollege = getDisplayCollege();

  if (user.isProfileComplete === false) return <Navigate to="/complete-profile" />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.profilePhoto ? <img src={`http://localhost:5000${user.profilePhoto}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user.fullName.charAt(0)}</span>}
        </div>
        <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '2.5rem', margin: 0 }}>
                Welcome, <span style={{ color: 'var(--color-accent)' }}>{user.fullName}</span>
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '1.4rem', fontWeight: '500', color: '#60a5fa' }}>
                {displayCollege}
            </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: user.role === 'Learner' ? '1fr' : '1fr', gap: '30px' }}>
        {user.role === 'Learner' && (
          <div className="glass-panel" style={{ marginBottom: '10px' }}>
            <h2 style={{ marginBottom: '20px' }}>Find a Tutor</h2>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={20} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--color-text-secondary)' }} />
                <input 
                  type="text" 
                  value={searchSkill}
                  onChange={(e) => setSearchSkill(e.target.value)}
                  placeholder="Search skills (e.g. React, Python...)" 
                  className="input-field" 
                  style={{ paddingLeft: '48px', marginBottom: 0 }}
                />
              </div>
              <button type="submit" className="btn-primary">Search</button>
            </form>
          </div>
        )}

        {/* Sessions Section */}
        <div>
          <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={24} className="text-accent" /> Active Learning Sessions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sessions.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)' }}>No active sessions scheduled.</p>
            ) : (
              sessions.map(sess => (
                <div key={sess._id} className="glass-panel" style={{ borderLeft: `4px solid ${sess.status === 'Completed' ? '#4ade80' : (sess.status === 'Expired' ? '#ef4444' : 'var(--color-accent)')}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {sess.tutorId?.profilePhoto ? <img src={`http://localhost:5000${sess.tutorId.profilePhoto}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{sess.tutorId?.fullName.charAt(0)}</span>}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Learning Session</h4>
                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)' }}>{sess.status}</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                        {user.role === 'Learner' ? `Tutor: ${sess.tutorId?.fullName}` : `Learner: ${sess.learnerId?.fullName}`}
                      </p>
                      <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: '500' }}>
                        Scheduled: {formatDate(sess.schedule)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button 
                        className="btn-outline" 
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setActiveChat(user.role === 'Learner' ? sess.tutorId : sess.learnerId)}
                      >
                        <MessageSquare size={18} /> Chat
                      </button>
                      {user.role === 'Tutor' && sess.status === 'Confirmed' && (
                        <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => handleMarkCompleted(sess._id)}>
                          Complete
                        </button>
                      )}
                      {sess.status === 'Expired' && (
                        <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                          <AlertTriangle size={16} /> Expired
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Requests Section */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>{user.role === 'Learner' ? 'My Demo Requests' : 'Incoming Requests'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)' }}>No requests found.</p>
            ) : (
              requests.map(req => (
                <div key={req._id} className="glass-panel" style={{ borderLeft: req.status === 'Expired' ? '4px solid #ef4444' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>Skill: {req.skill}</h4>
                      <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                        {user.role === 'Learner' ? `To: ${req.tutorId?.fullName}` : `From: ${req.learnerId?.fullName}`}
                      </p>
                      <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                          "{req.description}"
                        </p>
                      </div>
                      <p style={{ margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                        <Clock size={16} /> {formatDate(req.requestedTime)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '20px' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                        background: req.status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : (req.status === 'Accepted' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                        color: req.status === 'Pending' ? '#facc15' : (req.status === 'Accepted' ? '#4ade80' : '#f87171')
                      }}>
                        {req.status}
                      </span>
                      {user.role === 'Tutor' && req.status === 'Pending' && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleRequestStatus(req._id, 'Accepted')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Accept</button>
                          <button onClick={() => handleRequestStatus(req._id, 'Rejected')} className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>Reject</button>
                        </div>
                      )}
                      {(req.status === 'Accepted') && (
                        <div style={{ marginTop: '12px' }}>
                          <button 
                            className="btn-outline" 
                            style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
                            onClick={() => setActiveChat(user.role === 'Learner' ? req.tutorId : req.learnerId)}
                          >
                            <MessageSquare size={16} /> Chat
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {activeChat && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '350px', zIndex: 2000 }}>
          <ChatWindow chatWith={activeChat} onClose={() => setActiveChat(null)} />
        </div>
      )}

      {user.role === 'Learner' && tutors.length > 0 && (
         <div style={{ marginTop: '40px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Recommended Tutors</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
               {tutors.slice(0, 3).map(t => (
                  <div key={t._id} className="glass-panel">
                     <h4 style={{ margin: 0 }}>{t.fullName}</h4>
                     <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{t.skills.join(', ')}</p>
                     <Link to={`/profile/${t._id}`} className="text-accent" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>View Profile →</Link>
                  </div>
               ))}
            </div>
         </div>
      )}
      
    </div>
  );
};

export default Dashboard;
