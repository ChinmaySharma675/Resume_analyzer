import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UploadCloud, File, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Upload = () => {
  const [file, setFile] = useState(null);
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
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Upload Resume</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Upload your resume in PDF format. Our NLP engine will extract your skills and experience for job matching.</p>
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
                accept=".pdf,.docx" 
                hidden 
                onChange={handleChange} 
              />
              
              {!file ? (
                <>
                  <div style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <UploadCloud size={48} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Click or drag file to this area to upload</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Support for a single or bulk upload. Strictly PDF or DOCX.</p>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <File size={48} color="var(--primary)" />
                  <div style={{ fontWeight: '500' }}>{file.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              )}
            </div>

            {error && <div style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '2rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }} 
                onClick={() => setFile(null)}
                disabled={!file || loading}
              >
                Clear
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 2 }} 
                onClick={handleUpload}
                disabled={!file || loading}
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
