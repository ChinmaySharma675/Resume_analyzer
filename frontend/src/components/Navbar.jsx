import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FileText, LogOut, Upload, Briefcase, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-nav">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} color="white" />
          </div>
          <span style={{ color: 'var(--text-main)' }}>
            ResumeAnalyzer
          </span>
        </Link>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', color: 'var(--text-main)', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'var(--primary)'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'transparent'; }}>
                Dashboard
              </Link>
              <Link to="/upload" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', color: 'var(--text-main)', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'var(--primary)'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'transparent'; }}>
                <Upload size={18} /> Upload
              </Link>
              <Link to="/job-matching" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', color: 'var(--text-main)', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'var(--primary)'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'transparent'; }}>
                <Briefcase size={18} /> Jobs
              </Link>
              <Link to="/job-eligibility" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', color: 'var(--text-main)', transition: 'all 0.2s', fontWeight: '500' }} onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'var(--primary)'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'transparent'; }}>
                <Target size={18} /> Eligibility
              </Link>
              <div style={{ width: '1px', height: '1.5rem', background: 'var(--border-light)' }}></div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: '600' }}>{user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-main)' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
