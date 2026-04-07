import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, DollarSign, ArrowRight, Headset } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

  const Landing = () => {
  const { user } = useContext(AuthContext);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const description = formData.get('description');
    const adminEmail = 'jagathreddykanni@gmail.com';
    const subject = encodeURIComponent('Campus Skill Connect - Support Query');
    const body = encodeURIComponent(`Hello Admin,\n\nMy name is ${name}.\n\nIssue/Query:\n${description}\n\nSent from Campus Skill Connect Platform.`);
    
    window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ marginBottom: '80px', animation: 'fadeIn 1s ease-out' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: '1.2' }}>
          Connect <span style={{ color: 'var(--color-accent)' }}>Learn</span> Grow
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 40px' }}>
          Turn your campus into a knowledge hub. Learn new skills from talented peers or earn by teaching what you know.
        </p>
        
        {user ? (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', padding: '14px 28px' }}>
              Go to Dashboard <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/register" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', padding: '14px 28px' }}>
              Start Learning <ArrowRight size={20} />
            </Link>
            <Link to="/register" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', padding: '14px 28px' }}>
              Become a Tutor <ArrowRight size={20} />
            </Link>
          </div>
        )}
        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
          <img src="/images/hero.png" alt="Students Learning" style={{ width: '100%', maxWidth: '800px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', objectFit: 'cover' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '60px' }}>
        <div className="glass-panel" style={{ textAlign: 'left' }}>
          <div style={{ background: 'rgba(14, 165, 233, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: '20px' }}>
            <Users size={24} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Find Peers</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>Search for students exactly in your campus who have the skills you need and are ready to teach.</p>
        </div>

        <div className="glass-panel" style={{ textAlign: 'left' }}>
          <div style={{ background: 'rgba(14, 165, 233, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: '20px' }}>
            <BookOpen size={24} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Request a Demo</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>Connect directly by requesting a demo. Check if the teaching style matches your needs before committing.</p>
        </div>

        <div className="glass-panel" style={{ textAlign: 'left' }}>
          <div style={{ background: 'rgba(14, 165, 233, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: '20px' }}>
            <DollarSign size={24} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Negotiate & Learn</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>No fixed expensive fees. Negotiate a fair price directly with your peer tutor and start learning.</p>
        </div>
      </div>

      <div style={{ marginTop: '100px', display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap-reverse', textAlign: 'left' }}>
        <div style={{ flex: '1 1 400px' }}>
          <img src="/images/contact.png" alt="Contact Support" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} />
        </div>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
              <Headset size={32} />
            </div>
            <h2 style={{ fontSize: '2.5rem' }}>We're Here for You</h2>
          </div>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '30px', lineHeight: '1.6' }}>
            Got questions? Need help setting up your tutor profile or finding the right peer mentor? Send us an email detailing the issue you're facing, and we'll help out!
          </p>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <form onSubmit={handleContactSubmit}>
              <input type="text" name="name" className="input-field" placeholder="Your Name" required />
              <input type="email" name="email" className="input-field" placeholder="Your Email (Optional for mailto)" />
              <textarea name="description" className="input-field" rows="4" placeholder="Describe the issue you are facing..." required></textarea>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Message</button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
