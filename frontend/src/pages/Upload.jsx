import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UploadCloud, File, CheckCircle, Type, Image as ImageIcon, Brain, Shield, Zap, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      const ext = dropped.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'png', 'jpg', 'jpeg'].includes(ext)) {
        setError('Only PDF, DOCX, or image files are allowed.');
        return;
      }
      setFile(dropped);
      setError('');
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'png', 'jpg', 'jpeg'].includes(ext)) {
        setError('Only PDF, DOCX, or image files are allowed.');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (uploadMode === 'file' && !file) return;
    if (uploadMode === 'text' && !textInput.trim()) return;

    setLoading(true);
    setError('');
    setProgress('Uploading resume...');

    try {
      let resumeId;

      // Step 1: Upload the resume
      if (uploadMode === 'file') {
        const formData = new FormData();
        formData.append('resume', file);
        if (jobDescription.trim()) formData.append('target_job', 'Job Analysis');

        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        resumeId = uploadRes.data.resume_id;
      } else {
        const uploadRes = await api.post('/upload', { text: textInput, target_job: 'Job Analysis' });
        resumeId = uploadRes.data.resume_id;
      }

      // Step 2: If job description provided, run the job-aware analysis
      if (jobDescription.trim()) {
        setProgress('Analyzing resume against job description...');
        const analyzeRes = await api.post('/resume/analyze', {
          resume_id: resumeId,
          job_description: jobDescription
        });

        setSuccess(true);
        setProgress('');
        // Redirect to analysis page with the analysis_id
        setTimeout(() => navigate(`/resume/${resumeId}/analysis?analysis_id=${analyzeRes.data.analysis_id}`), 1500);
      } else {
        setSuccess(true);
        setProgress('');
        setTimeout(() => navigate('/dashboard'), 1500);
      }

    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.response?.data?.message || err.message || 'Error uploading file');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem' }}>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2' }}>
          <span style={{ background: 'linear-gradient(to right, #10b981, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Context-Aware
          </span>
          <br />
          <span style={{ color: '#0f172a' }}>Resume Analyzer</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
          AI-powered analysis that scores your resume against a specific job description — not just keywords.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        width: '100%',
        maxWidth: '800px',
        marginBottom: '3rem'
      }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: '0.75rem' }}>
          <div style={{ color: '#10b981', marginBottom: '0.75rem' }}><Brain size={20} /></div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>Context-Aware</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Semantic analysis beyond keyword matching</p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: '0.75rem' }}>
          <div style={{ color: '#10b981', marginBottom: '0.75rem' }}><Shield size={20} /></div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>Bias-Free</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fair evaluation for freshers & students</p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: '0.75rem' }}>
          <div style={{ color: '#10b981', marginBottom: '0.75rem' }}><Zap size={20} /></div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>Instant Results</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get detailed feedback in seconds</p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: '0.75rem' }}>
          <div style={{ color: '#10b981', marginBottom: '0.75rem' }}><Users size={20} /></div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>Fresher-Friendly</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Designed for students & graduates</p>
        </div>
      </div>

      {/* Upload Mode Toggle */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '1rem' }}>
        <button
          onClick={() => setUploadMode('file')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: uploadMode === 'file' ? 'var(--primary)' : 'transparent',
            color: uploadMode === 'file' ? 'white' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: '500'
          }}
        >
          <ImageIcon size={18} /> File Upload
        </button>
        <button
          onClick={() => setUploadMode('text')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: uploadMode === 'text' ? 'var(--primary)' : 'transparent',
            color: uploadMode === 'text' ? 'white' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: '500'
          }}
        >
          <Type size={18} /> Paste Text
        </button>
      </div>

      {/* Main Upload Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card" style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <CheckCircle size={64} color="var(--success)" />
            </motion.div>
            <h2>Analysis Complete!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Redirecting to results...</p>
          </div>
        ) : (
          <>
            {/* Resume Upload/Paste Area */}
            {uploadMode === 'file' ? (
              <div
                className="dropzone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileUpload').click()}
                style={{ width: '100%' }}
              >
                <input
                  id="fileUpload"
                  type="file"
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  hidden
                  onChange={handleChange}
                />
                {!file ? (
                  <>
                    <div style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                      <UploadCloud size={48} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Click or drag file to this area to upload</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Support for PDF, DOCX, PNG, JPG.</p>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <File size={48} color="var(--primary)" />
                    <div style={{ fontWeight: '500' }}>{file.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <textarea
                  className="input"
                  placeholder="Paste your resume text here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    resize: 'vertical',
                    padding: '1rem',
                    fontFamily: 'inherit',
                    color: '#0f172a',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-light)'
                  }}
                />
              </div>
            )}

            {/* Job Description Textarea */}
            <div style={{ width: '100%', marginTop: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block', fontSize: '0.95rem' }}>
                📋 Job Description <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>(paste the full JD for AI scoring)</span>
              </label>
              <textarea
                placeholder="Paste the full job description here... e.g. 'We are looking for a Python developer with experience in Flask, Machine Learning, Docker...'"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  resize: 'vertical',
                  padding: '1rem',
                  fontFamily: 'inherit',
                  color: '#0f172a',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6'
                }}
              />
              {!jobDescription.trim() && (
                <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.35rem' }}>
                  ⚠️ Without a job description, only basic resume analysis will be performed.
                </p>
              )}
            </div>

            {error && <div style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.08)', padding: '0.75rem 1rem', borderRadius: '0.5rem', width: '100%' }}>{error}</div>}

            {progress && (
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                <div style={{
                  width: '20px', height: '20px', border: '3px solid var(--border-light)',
                  borderTopColor: 'var(--primary)', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                {progress}
              </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '2rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setFile(null);
                  setTextInput('');
                  setJobDescription('');
                  setError('');
                }}
                disabled={loading}
              >
                Clear
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleUpload}
                disabled={(uploadMode === 'file' && !file) || (uploadMode === 'text' && !textInput) || loading}
              >
                {loading ? 'Analyzing...' : (jobDescription.trim() ? '🚀 Analyze Against Job' : '📤 Upload Resume')}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Upload;
