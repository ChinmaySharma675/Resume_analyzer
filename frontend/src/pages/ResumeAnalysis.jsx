import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, FileText, Check } from 'lucide-react';

const ResumeAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/resume/${id}/analyze`);
        setData(res.data);
      } catch (err) {
        setError("Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) return <div className="container main-content" style={{ textAlign: 'center', padding: '4rem' }}>Loading Analysis...</div>;
  if (error || !data) return <div className="container main-content" style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)' }}>{error || "Analysis not found."}</div>;

  // Calculate circle logic
  const score = data.score;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 50) return '#fbbf24';
    return '#ef4444';
  };
  
  const getScoreText = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Average';
    return 'Needs Work';
  };

  return (
    <div className="container main-content" style={{ maxWidth: '900px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '500', padding: 0 }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      {/* Top Header Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', padding: '2.5rem', position: 'relative' }}>
        
        {/* Eligibility Badge */}
        {(() => {
          const skillsList = data.skills_found ? data.skills_found.filter(sk => sk.trim() !== '') : [];
          const isEligible = score > 70 && skillsList.length > 3;
          return (
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: isEligible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isEligible ? '#10b981' : '#ef4444',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: `1px solid ${isEligible ? '#10b981' : '#ef4444'}`
            }}>
              {isEligible ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {isEligible ? 'Eligible' : 'Rejected'}
            </div>
          );
        })()}

        {/* Score Circle */}
        <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="160" height="160" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
            {/* Background Circle */}
            <circle cx="80" cy="80" r={radius} fill="transparent" stroke="var(--border-light)" strokeWidth="12" />
            {/* Progress Circle */}
            <motion.circle 
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="80" cy="80" r={radius} 
              fill="transparent" 
              stroke={getScoreColor(score)} 
              strokeWidth="12" 
              strokeDasharray={circumference} 
              strokeLinecap="round"
            />
          </svg>
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: '1' }}>{Math.round(score)}</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div style={{ position: 'absolute', bottom: '-25px', fontWeight: 'bold', color: getScoreColor(score) }}>
            {getScoreText(score)}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Resume Analysis Complete</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '1rem' }}>
            {data.word_count} words analyzed • {data.sections_detected} sections detected • {data.skills_found.length} skills found
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {data.skills_found.filter(sk => sk.trim() !== '').slice(0, 7).map((skill, i) => (
              <span key={i} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)' }}>
                {skill.charAt(0).toUpperCase() + skill.slice(1)}
              </span>
            ))}
            {data.skills_found.length > 7 && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{data.skills_found.length - 7} more</span>}
          </div>
        </div>
      </div>

      {/* Section Breakdown Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Section Breakdown</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {data.section_breakdown.map((sec, idx) => {
            const pct = Math.round((sec.score / sec.max) * 100);
            let Icon = CheckCircle2;
            let color = 'var(--success)';
            if (pct < 50) { Icon = XCircle; color = 'var(--danger)'; }
            else if (pct < 80) { Icon = AlertTriangle; color = '#fbbf24'; }

            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                    <Icon size={18} color={color} /> {sec.name}
                  </div>
                  <div style={{ fontWeight: '600' }}>{sec.score}/{sec.max}</div>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                    style={{ height: '100%', background: color }}
                  />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{sec.message}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Improvement Suggestions ({data.suggestions.length})</h2>
        {data.suggestions.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
             <Check size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
             <p>Your resume looks fantastic! No major suggestions at this time.</p>
           </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.suggestions.map((sug, idx) => {
              let tagColor = 'rgba(16, 185, 129, 0.1)';
              let tagTextColor = '#10b981';
              if (sug.priority === 'High Priority') {
                tagColor = 'rgba(239, 68, 68, 0.1)';
                tagTextColor = '#ef4444';
              } else if (sug.priority === 'Medium Priority') {
                tagColor = 'rgba(251, 191, 36, 0.1)';
                tagTextColor = '#f59e0b';
              }
              
              let Icon = FileText;
              let iconBg = '#f1f5f9';
              if (sug.category === 'Impact') Icon = AlertTriangle;
              if (sug.category === 'Skills') Icon = CheckCircle2;

              return (
                <div key={idx} style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-light)' }}>
                   <div style={{ background: iconBg, padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
                      <Icon size={20} color="var(--text-muted)" />
                   </div>
                   <div style={{ flex: 1 }}>
                     <p style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{sug.text}</p>
                     <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>{sug.category}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.1rem 0.5rem', borderRadius: '9999px', background: tagColor, color: tagTextColor }}>
                          {sug.priority}
                        </span>
                     </div>
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ResumeAnalysis;
