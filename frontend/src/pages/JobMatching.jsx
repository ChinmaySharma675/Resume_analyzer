import React, { useState, useEffect } from 'react';
import api from '../api';
import { Briefcase, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const JobMatching = () => {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedResume, setSelectedResume] = useState('');
  const [matchScore, setMatchScore] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Create job form state
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchResumes();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResumes = async () => {
    try {
      const { data } = await api.get('/resumes');
      setResumes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/job', { title: newTitle, description: newDesc });
      setShowCreate(false);
      setNewTitle('');
      setNewDesc('');
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMatch = async () => {
    if (!selectedJob || !selectedResume) return;
    setLoading(true);
    try {
      const { data } = await api.post('/match', {
        resume_id: parseInt(selectedResume),
        job_id: selectedJob.id
      });
      setMatchScore(data.match_score);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Job Matching</h1>
          <p style={{ color: 'var(--text-muted)' }}>Match your resumes against job descriptions to see your fit.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : 'Add New Job'}
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card" style={{ marginBottom: '2rem' }}>
          <h3>Create Job Description</h3>
          <form onSubmit={handleCreateJob} style={{ marginTop: '1rem' }}>
            <div className="input-group">
              <label>Job Title</label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="e.g. Senior Frontend Developer" />
            </div>
            <div className="input-group">
              <label>Job Description</label>
              <textarea rows="5" value={newDesc} onChange={e => setNewDesc(e.target.value)} required placeholder="Paste the job description here..." />
            </div>
            <button type="submit" className="btn btn-primary">Save Job</button>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Available Jobs</h3>
          {jobs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '1rem' }}>No jobs available. Create one to begin.</div>
          ) : (
            jobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => { setSelectedJob(job); setMatchScore(null); }}
                className="card" 
                style={{ 
                  cursor: 'pointer', 
                  border: selectedJob?.id === job.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                  padding: '1.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <Briefcase size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.125rem' }}>{job.title}</h4>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ID: {job.id}</span>
                  </div>
                </div>
                <ChevronRight color={selectedJob?.id === job.id ? 'var(--primary)' : 'var(--text-muted)'} />
              </div>
            ))
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Match Analysis</h3>
          <div className="card" style={{ marginTop: '1rem', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            {!selectedJob ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Select a job from the list to analyze your fit.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{selectedJob.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxHeight: '100px', overflowY: 'auto' }}>
                    {selectedJob.description.substring(0, 150)}...
                  </p>
                </div>
                
                <div className="input-group">
                  <label>Select Your Resume</label>
                  <select 
                    value={selectedResume} 
                    onChange={e => { setSelectedResume(e.target.value); setMatchScore(null); }}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: 'var(--text-main)' }}
                  >
                    <option value="">-- Choose a resume --</option>
                    {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
                  </select>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={handleMatch} 
                  disabled={!selectedResume || loading}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Analyzing Compatibility...' : 'Calculate Match Score'}
                </button>

                {matchScore !== null && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Compatibility Score</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                      <Activity size={32} color={matchScore > 70 ? 'var(--success)' : (matchScore > 40 ? '#eab308' : 'var(--danger)')} />
                      <span style={{ fontSize: '3rem', fontWeight: 'bold', color: matchScore > 70 ? 'var(--success)' : (matchScore > 40 ? '#eab308' : 'var(--danger)') }}>
                        {matchScore}%
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobMatching;
