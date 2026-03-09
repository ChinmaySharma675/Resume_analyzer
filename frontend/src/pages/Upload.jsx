import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UploadCloud, File, CheckCircle, Type, Image as ImageIcon, Brain, Shield, Zap, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (uploadMode === 'file' && !file) return;
    if (uploadMode === 'text' && !textInput.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      if (uploadMode === 'file') {
        const formData = new FormData();
        formData.append('resume', file);
        if (targetJob.trim()) formData.append('target_job', targetJob.trim());
        
        await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/upload', { text: textInput, target_job: targetJob.trim() });
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
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
          AI-powered semantic analysis that understands your skills, projects, and potential — not just keywords.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '1rem', 
        width: '100%', 
        maxWidth: '800px', 
        marginBottom: '4rem' 
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
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Designed students & graduates</p>
        </div>
      </div>

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

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <CheckCircle size={64} color="var(--success)" />
            </motion.div>
            <h2>Upload Successful!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
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
                    minHeight: '250px', 
                    resize: 'vertical',
                    padding: '1rem',
                    fontFamily: 'inherit',
                    color: '#0f172a', /* Darken font color explicitly */
                    backgroundColor: '#f1f5f9'
                  }}
                />
              </div>
            )}

            <div className="input-group" style={{ width: '100%', marginTop: '1.5rem', marginBottom: '0' }}>
              <label style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Target Job Role (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Software Engineer, Data Scientist" 
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}
              />
            </div>

            {error && <div style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '2rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }} 
                onClick={() => {
                  setFile(null);
                  setTextInput('');
                  setTargetJob('');
                }}
                disabled={(uploadMode === 'file' && !file) || (uploadMode === 'text' && !textInput) || loading}
              >
                Clear
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 2 }} 
                onClick={handleUpload}
                disabled={(uploadMode === 'file' && !file) || (uploadMode === 'text' && !textInput) || loading}
              >
                {loading ? 'Uploading & Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Upload;
