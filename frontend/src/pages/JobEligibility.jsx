import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Target, CheckCircle2, XCircle, AlertCircle, ChevronRight, Briefcase } from 'lucide-react';
import { jobsData } from '../utils/jobsData';

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
    // Basic exact/includes matching, case-insensitive
    const reqLower = requiredSkill.toLowerCase();
    return skills.some(s => {
      const sLower = s.toLowerCase();
      // "React.js" match "React" or "React" match "React.js"
      return sLower.includes(reqLower) || reqLower.includes(sLower);
    });
  };

  const jobSuggestions = useMemo(() => {
    if (skills.length === 0) return [];

    return jobsData.map(job => {
      const matchRequiredCount = job.requiredSkills.filter(hasSkill).length;
      const matchPreferredCount = job.preferredSkills.filter(hasSkill).length;

      const totalRequired = job.requiredSkills.length;
      const totalPreferred = job.preferredSkills.length;

      // Calculate score giving more weight to required skills
      const matchScore = ((matchRequiredCount * 2) + matchPreferredCount) / ((totalRequired * 2) + totalPreferred || 1);

      return {
        ...job,
        matchScore: matchScore * 100,
        matchRequiredCount,
        matchPreferredCount
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3); // top 3
  }, [skills]);

  return (
    <div className="container" style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Job Eligibility Checker</h1>
        <p style={{ color: 'var(--text-muted)' }}>Test your skills against different job roles and get suggestions.</p>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} color="var(--primary)" /> Your Skills
        </h2>

        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            className="input"
            placeholder="E.g. Python, React, MongoDB..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Skill
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {skills.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>No skills added yet. Add some to see how you match up!</p>
          ) : (
            skills.map((skill, index) => (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                key={index}
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  <X size={14} />
                </button>
              </motion.span>
            ))
          )}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

        {/* Test Job Eligibility */}
        <section className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Test Specific Job</h2>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <select
              className="input"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{ width: '100%', appearance: 'none', paddingRight: '2.5rem' }}
            >
              <option value="">-- Select a Job Role --</option>
              {jobsData.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
              <ChevronRight size={18} style={{ transform: 'rotate(90deg)' }} />
            </div>
          </div>

          {selectedJob ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{selectedJob.description}</p>

                <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Required Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedJob.requiredSkills.map((skill, index) => {
                    const match = hasSkill(skill);
                    return (
                      <span key={index} style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: match ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: match ? '#4ade80' : '#f87171',
                        border: `1px solid ${match ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                      }}>
                        {match ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {skill}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Preferred Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedJob.preferredSkills.map((skill, index) => {
                    const match = hasSkill(skill);
                    return (
                      <span key={index} style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: match ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: match ? '#4ade80' : 'var(--text-muted)',
                        border: `1px solid ${match ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                      }}>
                        {match ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {skill}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {(() => {
                  const reqMatch = selectedJob.requiredSkills.filter(hasSkill).length;
                  const reqTotal = selectedJob.requiredSkills.length;
                  const percentage = Math.round((reqMatch / reqTotal) * 100) || 0;

                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>Core Match</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: percentage >= 80 ? '#4ade80' : percentage >= 50 ? '#fbbf24' : '#f87171' }}>{percentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: percentage >= 80 ? '#4ade80' : percentage >= 50 ? '#fbbf24' : '#f87171',
                          transition: 'width 0.5s ease-out'
                        }}></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Briefcase size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>Select a job role from the dropdown to see how your skills match up to its requirements.</p>
            </div>
          )}
        </section>

        {/* Job Suggestions */}
        <section className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Top Suggested Roles</h2>

          {skills.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Target size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>Add some skills to get personalized job role suggestions.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobSuggestions.map((job, index) => (
                <div key={job.id} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#fff' }}>{job.title}</h3>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: job.matchScore >= 70 ? 'rgba(34, 197, 94, 0.2)' : job.matchScore >= 40 ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: job.matchScore >= 70 ? '#4ade80' : job.matchScore >= 40 ? '#facc15' : 'var(--text-muted)'
                    }}>
                      {Math.round(job.matchScore)}% Match
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {job.matchRequiredCount} of {job.requiredSkills.length} required skills
                  </div>

                  <button
                    onClick={() => setSelectedJobId(job.id.toString())}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'background 0.2s',
                      marginTop: '0.5rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              ))}
              {jobSuggestions.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No close matches found. Try adding more skills!</p>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default JobEligibility;
