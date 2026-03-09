import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { FileText, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    try {
      const { data } = await api.get('/resumes');
      setResumes(data);
    } catch (err) {
      console.error("Error fetching resumes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resume/${id}`);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <div className="container main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Your Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and analyze your uploaded resumes.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : resumes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <FileText size={48} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No resumes uploaded yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Upload your first resume to start analyzing.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {resumes.map((resume, index) => (
            <motion.div 
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
              style={{ padding: '1.5rem', position: 'relative' }}
            >
              {/* Eligibility Badge */}
              {(() => {
                const skillsList = resume.skills ? resume.skills.split(',').filter(s => s.trim() !== '') : [];
                const isEligible = resume.score > 70 && skillsList.length > 3;
                return (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: isEligible ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {isEligible ? 'Eligible' : 'Rejected'}
                  </div>
                );
              })()}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                    <FileText size={20} color="var(--primary)" />
                  </div>
                  <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', title: resume.filename }}>{resume.filename}</h4>
                </div>
                <button onClick={() => handleDelete(resume.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detected Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {resume.skills ? resume.skills.split(',').map(skill => (
                    <span key={skill} style={{ background: '#f1f5f9', border: '1px solid var(--border-light)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                      {skill.trim()}
                    </span>
                  )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No defined skills extracted</span>}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <Link to={`/resume/${resume.id}/analysis`} className="btn btn-primary" style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  View Full Analysis
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
