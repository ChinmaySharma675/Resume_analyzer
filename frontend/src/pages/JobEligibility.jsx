import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, ChevronRight } from 'lucide-react';
import { jobsData } from '../utils/jobsData';

const chipColors = [
  { bg: '#f3e8ff', text: '#9333ea' },
  { bg: '#22c55e', text: '#ffffff' },
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#fce7f3', text: '#db2777' },
  { bg: '#fef08a', text: '#854d0e' },
  { bg: '#e0e7ff', text: '#4338ca' },
  { bg: '#f59e0b', text: '#ffffff' },
];

const JobEligibility = () => {
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.map(s => s.toLowerCase()).includes(skillInput.trim().toLowerCase())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobsData.find(job => job.id === parseInt(selectedJobId));
  }, [selectedJobId]);

  const hasSkill = (requiredSkill) => {
    const reqLower = requiredSkill.toLowerCase();
    return skills.some(s => {
      const sLower = s.toLowerCase();
      return sLower.includes(reqLower) || reqLower.includes(sLower);
    });
  };

  const selectedJobMatch = useMemo(() => {
    if (!selectedJob) return null;
    const matchRequiredCount = selectedJob.requiredSkills.filter(hasSkill).length;
    const matchPreferredCount = selectedJob.preferredSkills.filter(hasSkill).length;
    const totalRequired = selectedJob.requiredSkills.length;
    const totalPreferred = selectedJob.preferredSkills.length;
    const matchScore = ((matchRequiredCount * 2) + matchPreferredCount) / ((totalRequired * 2) + totalPreferred || 1);
    return matchScore * 100;
  }, [selectedJob, skills]);

  const jobSuggestions = useMemo(() => {
    if (skills.length === 0) return [];

    return jobsData.map(job => {
      const matchRequiredCount = job.requiredSkills.filter(hasSkill).length;
      const matchPreferredCount = job.preferredSkills.filter(hasSkill).length;
      const totalRequired = job.requiredSkills.length;
      const totalPreferred = job.preferredSkills.length;

      const matchScore = ((matchRequiredCount * 2) + matchPreferredCount) / ((totalRequired * 2) + totalPreferred || 1);

      return {
        ...job,
        matchScore: matchScore * 100,
        matchRequiredCount,
        matchPreferredCount
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  }, [skills]);

  // Modern UI Styles
  const columnStyle = {
    background: '#f8fafc',
    borderRadius: '1rem',
    padding: '1.5rem',
    flex: '1',
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
  };

  const columnHeaderStyle = {
    fontSize: '1.75rem',
    fontWeight: '800',
    fontFamily: 'serif',
    color: '#0f172a'
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '1rem',
    padding: '1.25rem',
    boxShadow: '0 4px 10px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const chipStyle = (bg, text) => ({
    background: bg,
    color: text,
    padding: '0.35rem 0.85rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    whiteSpace: 'nowrap'
  });

  const skeletonLine = (width = '100%') => (
    <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '10px', width }} />
  );

  const skeletonSquare = () => (
    <div style={{ width: '28px', height: '28px', border: '2px solid #e2e8f0', borderRadius: '6px' }} />
  );

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '100vh', background: '#ffffff', color: '#0f172a' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'serif', color: '#0f172a', marginBottom: '0.5rem' }}>Job Eligibility Checker</h1>
        <p style={{ color: '#64748b' }}>Test your skills against different job roles and get suggestions encoded in simple tags.</p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>

        {/* Column 1: Your Skills (Like "Doing") */}
        <div style={columnStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={columnHeaderStyle}>Skills</h2>
            <span style={{ color: '#cbd5e1', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>⋮</span>
          </div>

          <div style={cardStyle}>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="E.g. Python..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: '#0f172a', color: '#fff', cursor: 'pointer' }}>
                <Plus size={18} />
              </button>
            </form>
          </div>

          {skills.length > 0 && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map((skill, index) => {
                  const color = chipColors[index % chipColors.length];
                  return (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={index}
                      style={chipStyle(color.bg, color.text)}
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        style={{ background: 'transparent', border: 'none', color: color.text, cursor: 'pointer', display: 'flex', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </motion.span>
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {skeletonLine('85%')}
                {skeletonLine('60%')}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {skeletonSquare()}
                {skeletonSquare()}
                {skeletonSquare()}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Test Job! */}
        <div style={columnStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={columnHeaderStyle}>Test Job!</h2>
            <span style={{ color: '#cbd5e1', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>⋮</span>
          </div>

          <div style={cardStyle}>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{ width: '100%', appearance: 'none', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '500', outline: 'none', color: '#0f172a' }}
              >
                <option value="">-- Choose Role --</option>
                {jobsData.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
                <ChevronRight size={18} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
          </div>

          {selectedJob && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={cardStyle}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <span style={chipStyle('#fef08a', '#854d0e')}>{selectedJob.title}</span>
                {selectedJobMatch >= 70 && (
                  <span style={chipStyle('#22c55e', '#ffffff')}>Eligible</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>{selectedJob.description}</p>
                {skeletonLine('90%')}
                {skeletonLine('70%')}
              </div>

              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.5rem' }}>Mandatory Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedJob.requiredSkills.map((skill, i) => {
                    const match = hasSkill(skill);
                    return (
                      <span key={i} style={chipStyle(match ? '#22c55e' : '#fee2e2', match ? '#ffffff' : '#ef4444')}>
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {skeletonSquare()}
                {skeletonSquare()}
              </div>
            </motion.div>
          )}
        </div>

        {/* Column 3: Top Suggested Roles (Like "To do!") */}
        <div style={columnStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={columnHeaderStyle}>Suggested</h2>
            <span style={{ color: '#cbd5e1', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>⋮</span>
          </div>

          {skills.length === 0 ? (
            <div style={{ ...cardStyle, color: '#94a3b8', textAlign: 'center', padding: '2rem 1rem', boxShadow: 'none', background: 'transparent' }}>
              Add skills to see suggestions!
            </div>
          ) : (
            jobSuggestions.map((job, idx) => {
              const bgScore = job.matchScore >= 70 ? '#22c55e' : job.matchScore >= 40 ? '#f59e0b' : '#f1f5f9';
              const textScore = job.matchScore >= 70 ? '#ffffff' : job.matchScore >= 40 ? '#ffffff' : '#64748b';
              const tagColor = chipColors[(idx + 2) % chipColors.length];

              return (
                <div key={job.id} style={cardStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={chipStyle(tagColor.bg, tagColor.text)}>{job.title}</span>
                    <span style={chipStyle(bgScore, textScore)}>{Math.round(job.matchScore)}% Match</span>
                    {job.matchScore >= 70 && (
                      <span style={chipStyle('#22c55e', '#ffffff')}>Eligible</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Required Skills:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {job.requiredSkills.map((skill, i) => {
                        const match = hasSkill(skill);
                        return (
                          <span key={i} style={{ ...chipStyle(match ? '#22c55e' : '#fee2e2', match ? '#ffffff' : '#ef4444'), padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {skeletonSquare()}
                    {skeletonSquare()}
                    {skeletonSquare()}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default JobEligibility;
