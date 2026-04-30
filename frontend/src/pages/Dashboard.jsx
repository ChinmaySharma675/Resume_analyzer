import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { FileText, Trash2, History, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Accept/Reject verdict based on score out of 100
const getVerdict = (score) => {
  if (score >= 80) return { label: '✅ Likely Accepted', bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle size={14} /> };
  if (score >= 50) return { label: '⚠️ May be Reviewed', bg: '#fef9c3', color: '#92400e', icon: <AlertCircle size={14} /> };
  return { label: '❌ Likely Rejected', bg: '#fee2e2', color: '#dc2626', icon: <XCircle size={14} /> };
};

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [history, setHistory] = useState([]);
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

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/resume/history');
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resume/${id}`);
      setResumes(resumes.filter(r => r.id !== id));
      setHistory(history.filter(h => h.resume_id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <div className="container main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Your Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and analyze your uploaded resumes.</p>
        </div>
        <Link to="/upload" className="btn btn-primary">+ Upload Resume</Link>
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
          <Link to="/upload" className="btn btn-primary">Upload Resume</Link>
        </div>
      ) : (
        <>
          {/* Resume Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
                style={{ padding: '1.5rem', position: 'relative' }}
              >
                {/* Score Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  background: getScoreColor(resume.score),
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {resume.score}/100
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                      <FileText size={20} color="var(--primary)" />
                    </div>
                    <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resume.filename}</h4>
                  </div>
                  <button onClick={() => handleDelete(resume.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Upload date */}
                {resume.created_at && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Uploaded: {new Date(resume.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}

                {/* Accept/Reject Verdict Banner */}
                {(() => {
                  const v = getVerdict(resume.score);
                  return (
                    <div style={{
                      background: v.bg, color: v.color,
                      padding: '0.5rem 0.85rem', borderRadius: '0.5rem',
                      fontSize: '0.8rem', fontWeight: '700',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      marginBottom: '0.5rem', border: `1px solid ${v.color}33`
                    }}>
                      {v.icon} {v.label}
                    </div>
                  );
                })()}

                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detected Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {resume.skills ? resume.skills.split(',').slice(0, 6).map(skill => (
                      <span key={skill} style={{ background: '#f1f5f9', border: '1px solid var(--border-light)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                        {skill.trim()}
                      </span>
                    )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No skills extracted</span>}
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

          {/* ===== ANALYSIS HISTORY TABLE ===== */}
          {history.length > 0 && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={22} color="var(--primary)" /> Analysis History
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Resume</th>
                      <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Score</th>
                      <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Date</th>
                      <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry, idx) => (
                      <tr key={entry.analysis_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} color="var(--primary)" />
                          <span style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.resume_filename}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            background: getScoreColor(entry.overall_score),
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {Math.round(entry.overall_score)}/100
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <Link
                            to={`/resume/${entry.resume_id}/analysis?analysis_id=${entry.analysis_id}`}
                            style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <TrendingUp size={14} /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
