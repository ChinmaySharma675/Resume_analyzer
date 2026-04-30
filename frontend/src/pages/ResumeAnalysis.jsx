import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, FileText, Check, Lightbulb, Target, BookOpen, Award, Code, CheckCircle, AlertCircle } from 'lucide-react';

// ATS-standard verdict thresholds
const getVerdict = (score) => {
  if (score >= 80) return {
    label: 'Strong Candidate — Likely Accepted',
    sub: 'Your resume meets or exceeds the job requirements.',
    bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    color: '#15803d', border: '#86efac', icon: '✅'
  };
  if (score >= 60) return {
    label: 'Good Fit — May be Shortlisted',
    sub: 'You meet most requirements. A few improvements can seal the deal.',
    bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    color: '#1d4ed8', border: '#93c5fd', icon: '👍'
  };
  if (score >= 40) return {
    label: 'Average Match — May be Reviewed',
    sub: 'You meet some requirements. Strengthen your skills and experience.',
    bg: 'linear-gradient(135deg, #fef9c3, #fde68a)',
    color: '#92400e', border: '#fcd34d', icon: '⚠️'
  };
  return {
    label: 'Weak Match — Likely Rejected by ATS',
    sub: 'Your resume needs significant improvement for this role.',
    bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    color: '#dc2626', border: '#fca5a5', icon: '❌'
  };
};

const ResumeAnalysis = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('analysis_id');
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always fetch generic analysis
        const genericRes = await api.get(`/resume/${id}/analyze`);
        setData(genericRes.data);

        // If we have an analysis_id, fetch the job-aware analysis
        if (analysisId) {
          const jobRes = await api.get(`/resume/result/${analysisId}`);
          setJobData(jobRes.data);
        } else if (genericRes.data.job_analysis) {
          // Or use the latest one embedded in the generic response
          setJobData(genericRes.data.job_analysis);
        }
      } catch (err) {
        setError("Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, analysisId]);

  if (loading) return <div className="container main-content" style={{ textAlign: 'center', padding: '4rem' }}>Loading Analysis...</div>;
  if (error || !data) return <div className="container main-content" style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)' }}>{error || "Analysis not found."}</div>;

  // Use job-aware score if available, otherwise generic
  const hasJobAnalysis = !!jobData;
  const displayScore = hasJobAnalysis ? jobData.overall_score : data.score;

  // Score circle config
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

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

      {/* ===== TOP HEADER CARD WITH SCORE ===== */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', padding: '2.5rem', position: 'relative', flexWrap: 'wrap' }}>
        {/* Score Circle */}
        <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="160" height="160" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
            <circle cx="80" cy="80" r={radius} fill="transparent" stroke="var(--border-light)" strokeWidth="12" />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="80" cy="80" r={radius}
              fill="transparent"
              stroke={getScoreColor(displayScore)}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeLinecap="round"
            />
          </svg>
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: '1' }}>{Math.round(displayScore)}</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <div style={{ position: 'absolute', bottom: '-25px', fontWeight: 'bold', color: getScoreColor(displayScore) }}>
            {getScoreText(displayScore)}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {hasJobAnalysis ? 'Job-Aware Analysis Complete' : 'Resume Analysis Complete'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '1rem' }}>
            {data.word_count} words analyzed • {data.skills_found?.length || 0} skills found
            {hasJobAnalysis && ` • ${jobData.matched_keywords?.length || 0} keywords matched`}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(hasJobAnalysis ? jobData.resume_skills || [] : data.skills_found || [])
              .filter(sk => sk.trim() !== '').slice(0, 7).map((skill, i) => (
                <span key={i} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)' }}>
                  {skill}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* ===== ACCEPT / REJECT VERDICT BANNER ===== */}
      {(() => {
        const v = getVerdict(displayScore);
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: v.bg,
              border: `1.5px solid ${v.border}`,
              borderRadius: '1rem',
              padding: '1.25rem 2rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '2rem' }}>{v.icon}</span>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: v.color, marginBottom: '0.2rem' }}>
                {v.label}
              </div>
              <div style={{ fontSize: '0.875rem', color: v.color, opacity: 0.85 }}>
                {v.sub}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: v.color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Score</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: v.color }}>{Math.round(displayScore)}<span style={{ fontSize: '1rem' }}>/100</span></div>
            </div>
          </motion.div>
        );
      })()}
      {hasJobAnalysis && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={22} color="var(--primary)" /> Score Breakdown
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {/* Skill Match */}
            <ScoreCard
              icon={<Code size={22} />}
              title="Skill Match"
              score={jobData.skill_match}
              max={jobData.skill_match_max}
              color="#6366f1"
            />
            {/* Project Relevance */}
            <ScoreCard
              icon={<FileText size={22} />}
              title="Project Relevance"
              score={jobData.project_relevance}
              max={jobData.project_relevance_max}
              color="#10b981"
            />
            {/* Education */}
            <ScoreCard
              icon={<BookOpen size={22} />}
              title="Education"
              score={jobData.education}
              max={jobData.education_max}
              color="#f59e0b"
            />
            {/* Certifications */}
            <ScoreCard
              icon={<Award size={22} />}
              title="Certifications"
              score={jobData.certifications}
              max={jobData.certifications_max}
              color="#ec4899"
            />
          </div>
        </div>
      )}

      {/* ===== MATCHED / MISSING KEYWORDS ===== */}
      {hasJobAnalysis && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Matched Keywords */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#10b981" /> Matched Keywords ({jobData.matched_keywords?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(jobData.matched_keywords || []).length === 0 ? (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No matches found</span>
              ) : (
                jobData.matched_keywords.map((kw, i) => (
                  <span key={i} style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    ✓ {kw}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <XCircle size={18} color="#ef4444" /> Missing Keywords ({jobData.missing_keywords?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(jobData.missing_keywords || []).length === 0 ? (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>All keywords matched!</span>
              ) : (
                jobData.missing_keywords.map((kw, i) => (
                  <span key={i} style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    ✗ {kw}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== GENERIC SECTION BREAKDOWN (always shown) ===== */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
          {hasJobAnalysis ? 'Resume Quality Breakdown' : 'Section Breakdown'}
        </h2>
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

      {/* ===== IMPROVEMENT SUGGESTIONS ===== */}
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lightbulb size={22} color="#f59e0b" />
          Improvement Suggestions
        </h2>

        {/* Job-aware suggestions first */}
        {hasJobAnalysis && jobData.suggestions && jobData.suggestions.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: '600' }}>
              Based on Job Description:
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {jobData.suggestions.map((sug, idx) => (
                <div key={`job-${idx}`} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem',
                  border: '1px solid var(--border-light)'
                }}>
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--primary)',
                    width: '28px', height: '28px', minWidth: '28px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem'
                  }}>
                    {idx + 1}
                  </span>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>{sug}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generic suggestions */}
        {data.suggestions && data.suggestions.length > 0 ? (
          <div>
            {hasJobAnalysis && (
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: '600' }}>
                General Resume Tips:
              </h3>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.suggestions.map((sug, idx) => {
                let tagColor, tagTextColor, bgColor, iconEl;

                switch (sug.priority) {
                  case 'Positive':
                    tagColor = 'rgba(16, 185, 129, 0.15)';
                    tagTextColor = '#059669';
                    bgColor = '#f0fdf4';
                    iconEl = <CheckCircle2 size={20} color="#059669" />;
                    break;
                  case 'Tip':
                    tagColor = 'rgba(59, 130, 246, 0.15)';
                    tagTextColor = '#2563eb';
                    bgColor = '#eff6ff';
                    iconEl = <Target size={20} color="#2563eb" />;
                    break;
                  case 'High Priority':
                    tagColor = 'rgba(239, 68, 68, 0.1)';
                    tagTextColor = '#ef4444';
                    bgColor = '#fef2f2';
                    iconEl = <AlertTriangle size={20} color="#ef4444" />;
                    break;
                  case 'Medium Priority':
                    tagColor = 'rgba(251, 191, 36, 0.1)';
                    tagTextColor = '#f59e0b';
                    bgColor = '#fffbeb';
                    iconEl = <FileText size={20} color="#f59e0b" />;
                    break;
                  default: // Low Priority
                    tagColor = 'rgba(16, 185, 129, 0.1)';
                    tagTextColor = '#10b981';
                    bgColor = '#f8fafc';
                    iconEl = <FileText size={20} color="var(--text-muted)" />;
                }

                return (
                  <motion.div
                    key={`gen-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      display: 'flex', gap: '1rem', background: bgColor,
                      padding: '1.25rem', borderRadius: '0.75rem',
                      border: `1px solid ${sug.priority === 'Positive' ? '#bbf7d0' : sug.priority === 'Tip' ? '#bfdbfe' : 'var(--border-light)'}`
                    }}
                  >
                    <div style={{ background: sug.priority === 'Positive' ? '#dcfce7' : sug.priority === 'Tip' ? '#dbeafe' : '#f1f5f9', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
                      {iconEl}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{sug.text}</p>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>{sug.category}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.1rem 0.5rem', borderRadius: '9999px', background: tagColor, color: tagTextColor }}>
                          {sug.priority === 'Positive' ? '✅ Strength' : sug.priority === 'Tip' ? '🚀 Pro Tip' : sug.priority}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          !hasJobAnalysis && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Check size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
              <p>Your resume looks fantastic! No major suggestions at this time.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

/** Reusable Score Card for the 4-category breakdown */
const ScoreCard = ({ icon, title, score, max, color }) => {
  const pct = Math.round((score / max) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#f8fafc',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid var(--border-light)',
        textAlign: 'center'
      }}
    >
      <div style={{ color, marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
        {score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/{max}</span>
      </div>
      <div style={{ width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden', marginTop: '0.75rem' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ height: '100%', background: color, borderRadius: '3px' }}
        />
      </div>
    </motion.div>
  );
};

export default ResumeAnalysis;
