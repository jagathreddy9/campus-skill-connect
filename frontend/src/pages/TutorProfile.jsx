import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, BookOpen, Clock, Calendar, Mail } from 'lucide-react';

const TutorProfile = () => {
    const { id } = useParams();
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Demo Request State
    const [showModal, setShowModal] = useState(false);
    const [reqData, setReqData] = useState({ skill: '', description: '', requestedTime: '' });
    const [reqSuccess, setReqSuccess] = useState('');
    const [reqError, setReqError] = useState('');

    useEffect(() => {
        const fetchTutor = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/users/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setTutor(data);
                } else {
                    setError(data.msg || 'Failed to load profile');
                }
            } catch (err) {
                setError('Server error');
            }
            setLoading(false);
        };
        fetchTutor();
    }, [id, token]);

    const handleRequestDemo = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/requests`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...reqData, tutorId: id })
            });
            const data = await res.json();
            if (res.ok) {
                setReqSuccess('Demo requested successfully!');
                setTimeout(() => {
                    setShowModal(false);
                    navigate('/dashboard');
                }, 2000);
            } else {
                setReqError(data.msg || 'Request failed');
            }
        } catch (err) {
            setReqError('Server error');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Profile...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#ef4444' }}>{error}</div>;
    if (!tutor) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Tutor not found.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div className="glass-panel" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '30px' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--color-accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {tutor.profilePhoto ? <img src={`http://localhost:5000${tutor.profilePhoto}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{tutor.fullName.charAt(0)}</span>}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>{tutor.fullName}</h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', margin: '4px 0 0 0' }}>{tutor.course} • {tutor.pursuingYear}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><BookOpen size={20} className="text-accent" /> Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {tutor.skills?.map((skill, idx) => (
                                <span key={idx} style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--color-accent)', padding: '6px 14px', borderRadius: '16px', fontSize: '0.9rem' }}>
                                    {skill}
                                </span>
                            ))}
                            {(!tutor.skills || tutor.skills.length === 0) && <span style={{ color: 'var(--color-text-secondary)' }}>No skills listed.</span>}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><Calendar size={20} className="text-accent" /> Experience</h3>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{tutor.experience || 'Not specified'}</p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', gridColumn: '1 / -1' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><Clock size={20} className="text-accent" /> Availability</h3>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{tutor.availability || 'Not specified'}</p>
                    </div>
                </div>

                <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Mail size={18} className="text-accent"/> <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{tutor.collegeEmail}</span>
                    </div>
                    {tutor.personalEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={18} style={{ color: '#4ade80' }}/> <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>{tutor.personalEmail} (Personal)</span>
                        </div>
                    )}
                </div>

                {user?.role === 'Learner' && (
                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <button className="btn-primary" style={{ padding: '14px 40px', fontSize: '1.1rem' }} onClick={() => setShowModal(true)}>
                            Request a Demo
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        <h2 style={{ marginBottom: '20px' }}>Request Demo from {tutor.fullName.split(' ')[0]}</h2>
                        
                        {reqError && <div style={{ color: '#ef4444', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{reqError}</div>}
                        {reqSuccess && <div style={{ color: '#4ade80', marginBottom: '16px', background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px' }}>{reqSuccess}</div>}

                        <form onSubmit={handleRequestDemo}>
                            <div style={{ marginBottom: '16px' }}>
                                <label className="label">Topic / Skill to Learn</label>
                                <input type="text" className="input-field" required value={reqData.skill} onChange={(e) => setReqData({...reqData, skill: e.target.value})} placeholder="e.g. React Native basics" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label className="label">Message / Description</label>
                                <textarea className="input-field" rows="3" required value={reqData.description} onChange={(e) => setReqData({...reqData, description: e.target.value})} placeholder="What exactly do you want to learn?"></textarea>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label className="label">Preferred Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    className="input-field" 
                                    required 
                                    value={reqData.requestedTime} 
                                    onChange={(e) => setReqData({...reqData, requestedTime: e.target.value})} 
                                    style={{ colorScheme: 'dark' }} 
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Request</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorProfile;
