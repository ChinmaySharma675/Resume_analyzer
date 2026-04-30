import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronRight, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { jobsData } from '../utils/jobsData';

const chipColors = [
  { bg: '#f3e8ff', text: '#9333ea' },
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#fce7f3', text: '#db2777' },
  { bg: '#fef08a', text: '#854d0e' },
  { bg: '#e0e7ff', text: '#4338ca' },
];

// Accept/Reject verdict based on match score
const getVerdict = (score) => {
  if (score >= 70) return { label: '✅ Likely Accepted', bg: '#dcfce7', text: '#16a34a', icon: <CheckCircle size={16} /> };
  if (score >= 40) return { label: '⚠️ May be Reviewed', bg: '#fef9c3', text: '#92400e', icon: <AlertCircle size={16} /> };
  return { label: '❌ Likely Rejected', bg: '#fee2e2', text: '#dc2626', icon: <XCircle size={16} /> };
};

const JobEligibility = () => {
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [menuOpen, setMenuOpen] = useState(null); // 'skills' | 'job' | 'suggested' | null
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setSkills(prev => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleClearSkills = () => {
    setSkills([]);
    setMenuOpen(null);
  };

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobsData.find(job => job.id === parseInt(selectedJobId));
  }, [selectedJobId]);

// ── SKILL ALIASES: abbreviation → full names it should match ──
const SKILL_ALIASES = {
  // Common abbreviations
  'dsa': ['data structures', 'algorithms'],
  'ds': ['data structures', 'data science'],
  'algo': ['algorithms'],
  'ml': ['machine learning'],
  'dl': ['deep learning'],
  'ai': ['machine learning', 'deep learning', 'generative ai'],
  'nlp': ['nlp', 'natural language processing'],
  'cv': ['computer vision'],
  'gen ai': ['generative ai', 'llm', 'gpt'],
  'genai': ['generative ai', 'llm'],
  // Web
  'js': ['javascript'],
  'ts': ['typescript'],
  'react': ['react.js'],
  'reactjs': ['react.js'],
  'react.js': ['react.js'],
  'vue': ['vue.js'],
  'vuejs': ['vue.js'],
  'next': ['next.js'],
  'nextjs': ['next.js'],
  'node': ['node.js'],
  'nodejs': ['node.js'],
  'express': ['express.js'],
  'expressjs': ['express.js'],
  // Languages
  'cpp': ['c++'],
  'c++': ['c++'],
  'csharp': ['c#'],
  'c#': ['c#'],
  'golang': ['go'],
  // Databases
  'postgres': ['postgresql'],
  'mongo': ['mongodb'],
  'mysql': ['mysql'],
  'mssql': ['sql server'],
  'dynamo': ['dynamodb'],
  'elastic': ['elasticsearch'],
  // Cloud & DevOps
  'k8s': ['kubernetes'],
  'kube': ['kubernetes'],
  'tf': ['terraform'],
  'aws': ['aws'],
  'gcp': ['google cloud'],
  'cicd': ['ci/cd'],
  'ci/cd': ['ci/cd'],
  // Mobile
  'rn': ['react native'],
  'react native': ['react native'],
  'android dev': ['android'],
  'ios dev': ['ios'],
  // Testing
  'tdd': ['tdd', 'unit testing', 'test automation'],
  'bdd': ['bdd', 'integration testing'],
  'qa': ['unit testing', 'test automation', 'integration testing'],
  'testing': ['unit testing', 'test automation'],
  // Tools
  'vscode': ['vs code'],
  'figma': ['figma', 'ui/ux'],
  // Practices
  'oop': ['oop', 'object oriented'],
  'oops': ['oop'],
  'rest': ['rest api'],
  'restful': ['rest api'],
  'api': ['rest api', 'api design'],
  // Soft skills
  'communication': ['communication'],
  'team': ['teamwork'],
  'teamwork': ['teamwork', 'collaboration'],
  'leadership': ['leadership'],
  'pm': ['project management'],
  'agile': ['agile', 'scrum'],
  'scrum': ['scrum', 'agile'],
  // ML specific
  'tensorflow': ['tensorflow'],
  'pytorch': ['pytorch'],
  'sklearn': ['scikit-learn'],
  'scikit': ['scikit-learn'],
  'pandas': ['pandas'],
  'numpy': ['numpy'],
  'keras': ['keras'],
  'opencv': ['opencv', 'computer vision'],
  'huggingface': ['hugging face'],
  'langchain': ['langchain'],
  // Blockchain
  'web3': ['web3', 'blockchain'],
  'eth': ['ethereum'],
  'solidity': ['solidity', 'smart contracts'],
  // Security
  'pentest': ['penetration testing'],
  'infosec': ['cybersecurity', 'network security'],
  'cybersec': ['cybersecurity'],
};

// Reverse map: full skill name → all aliases that match it
const REVERSE_ALIASES = {};
for (const [alias, targets] of Object.entries(SKILL_ALIASES)) {
  for (const target of targets) {
    if (!REVERSE_ALIASES[target]) REVERSE_ALIASES[target] = [];
    REVERSE_ALIASES[target].push(alias);
  }
}

  const hasSkill = (requiredSkill) => {
    const reqLower = requiredSkill.toLowerCase();
    return skills.some(s => {
      const sLower = s.toLowerCase();
      // 1. Exact or substring match (original logic)
      if (sLower.includes(reqLower) || reqLower.includes(sLower)) return true;
      // 2. User typed an alias → check if it maps to this required skill
      const aliasTargets = SKILL_ALIASES[sLower];
      if (aliasTargets && aliasTargets.some(t => t === reqLower || reqLower.includes(t) || t.includes(reqLower))) return true;
      // 3. Required skill has aliases → check if user typed one
      const reverseAliases = REVERSE_ALIASES[reqLower];
      if (reverseAliases && reverseAliases.some(a => a === sLower || sLower.includes(a) || a.includes(sLower))) return true;
      return false;
    });
  };

  const selectedJobMatch = useMemo(() => {
    if (!selectedJob) return null;
    const matchReq = selectedJob.requiredSkills.filter(hasSkill).length;
    const matchPref = selectedJob.preferredSkills.filter(hasSkill).length;
    const totalReq = selectedJob.requiredSkills.length;
    const totalPref = selectedJob.preferredSkills.length;
    return ((matchReq * 2) + matchPref) / (((totalReq * 2) + totalPref) || 1) * 100;
  }, [selectedJob, skills]);

  const jobSuggestions = useMemo(() => {
    if (skills.length === 0) return [];
    return jobsData.map(job => {
      const matchReq = job.requiredSkills.filter(hasSkill).length;
      const matchPref = job.preferredSkills.filter(hasSkill).length;
      const totalReq = job.requiredSkills.length;
      const totalPref = job.preferredSkills.length;
      const matchScore = ((matchReq * 2) + matchPref) / (((totalReq * 2) + totalPref) || 1) * 100;
      return { ...job, matchScore, matchReq, matchPref };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  }, [skills]);

  const columnStyle = {
    background: '#f8fafc',
    borderRadius: '1rem',
    padding: '1.5rem',
    flex: '1',
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative',
  };

  const columnHeaderStyle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '1rem',
    padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const chipStyle = (bg, text) => ({
    background: bg,
    color: text,
    padding: '0.35rem 0.85rem',
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    whiteSpace: 'nowrap',
  });

  // Three-dot dropdown menu component
  const ThreeDotMenu = ({ id, options }) => (
    <div style={{ position: 'relative' }} ref={menuOpen === id ? menuRef : null}>
      <button
        onClick={() => setMenuOpen(menuOpen === id ? null : id)}
        title="Options"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#94a3b8', fontSize: '1.4rem', fontWeight: 'bold',
          padding: '0.25rem 0.5rem', borderRadius: '0.5rem',
          display: 'flex', alignItems: 'center',
          transition: 'background 0.15s',
        }}
        onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
        onMouseOut={e => e.currentTarget.style.background = 'none'}
      >
        ⋮
      </button>
      <AnimatePresence>
        {menuOpen === id && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'absolute', right: 0, top: '2.2rem',
              background: '#fff', borderRadius: '0.75rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              padding: '0.5rem',
              minWidth: '160px',
              zIndex: 100,
              border: '1px solid #e2e8f0',
            }}
          >
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => { opt.action(); setMenuOpen(null); }}
                style={{
                  width: '100%', textAlign: 'left', background: 'none',
                  border: 'none', padding: '0.6rem 1rem', borderRadius: '0.5rem',
                  cursor: 'pointer', fontSize: '0.875rem', color: opt.danger ? '#ef4444' : '#1e293b',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontWeight: '500',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div style={{ padding: '3rem 1.5rem', minHeight: '100vh', background: '#ffffff', color: '#0f172a', maxWidth: '1280px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
          Job Eligibility Checker
        </h1>
        <p style={{ color: '#64748b' }}>
          Add your skills, choose a job role, and see if you'd be accepted or rejected.
        </p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>

        {/* ===== COLUMN 1: SKILLS ===== */}
        <div style={columnStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={columnHeaderStyle}>Your Skills</h2>
            <ThreeDotMenu
              id="skills"
              options={[
                { label: 'Clear all skills', icon: <RefreshCw size={14} />, danger: true, action: handleClearSkills },
              ]}
            />
          </div>

          {/* Add skill form */}
          <div style={cardStyle}>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="E.g. Python, React, SQL..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                style={{
                  flex: 1, padding: '0.65rem 1rem', borderRadius: '0.5rem',
                  border: '1.5px solid #e2e8f0', background: '#f8fafc',
                  outline: 'none', fontSize: '0.9rem', color: '#0f172a',
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button
                type="submit"
                title="Add Skill"
                style={{
                  padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none',
                  background: '#0f172a', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#6366f1'}
                onMouseOut={e => e.currentTarget.style.background = '#0f172a'}
              >
                <Plus size={20} />
              </button>
            </form>
          </div>

          {/* Skills chips */}
          {skills.length > 0 ? (
            <div style={cardStyle}>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {skills.length} skill{skills.length !== 1 ? 's' : ''} added
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map((skill, index) => {
                  const color = chipColors[index % chipColors.length];
                  return (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={chipStyle(color.bg, color.text)}
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        title={`Remove ${skill}`}
                        style={{ background: 'transparent', border: 'none', color: color.text, cursor: 'pointer', display: 'flex', padding: 0 }}
                      >
                        <X size={13} />
                      </button>
                    </motion.span>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem', background: '#f8fafc', borderRadius: '1rem' }}>
              Type a skill and press the <strong>+</strong> button or Enter to add it.
            </div>
          )}
        </div>

        {/* ===== COLUMN 2: TEST JOB ===== */}
        <div style={columnStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={columnHeaderStyle}>Test a Job Role</h2>
            <ThreeDotMenu
              id="job"
              options={[
                { label: 'Reset selection', icon: <RefreshCw size={14} />, action: () => setSelectedJobId('') },
              ]}
            />
          </div>

          <div style={cardStyle}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select a job role to test against
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{
                  width: '100%', appearance: 'none', padding: '0.75rem 2.5rem 0.75rem 1rem',
                  borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: '#f8fafc',
                  fontWeight: '500', outline: 'none', color: '#0f172a', fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                <option value="">-- Choose a Role --</option>
                {jobsData.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
                <ChevronRight size={18} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedJob && selectedJobMatch !== null && (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* VERDICT BANNER */}
                {(() => {
                  const verdict = getVerdict(skills.length === 0 ? 0 : selectedJobMatch);
                  return (
                    <div style={{
                      background: verdict.bg, color: verdict.text,
                      padding: '0.85rem 1.25rem', borderRadius: '0.75rem',
                      fontWeight: '700', fontSize: '1rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      border: `1.5px solid ${verdict.text}33`,
                    }}>
                      {verdict.icon} {verdict.label}
                      {skills.length > 0 && <span style={{ marginLeft: 'auto', fontSize: '0.85rem', fontWeight: '600' }}>{Math.round(selectedJobMatch)}% match</span>}
                    </div>
                  );
                })()}

                <div style={cardStyle}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={chipStyle('#fef08a', '#854d0e')}>{selectedJob.title}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
                    {selectedJob.description}
                  </p>

                  <div>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Required Skills ({selectedJob.requiredSkills.filter(hasSkill).length}/{selectedJob.requiredSkills.length} matched)
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {selectedJob.requiredSkills.map((skill, i) => {
                        const match = hasSkill(skill);
                        return (
                          <span key={i} style={chipStyle(match ? '#dcfce7' : '#fee2e2', match ? '#16a34a' : '#dc2626')}>
                            {match ? <CheckCircle size={12} /> : <XCircle size={12} />} {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Preferred Skills ({selectedJob.preferredSkills.filter(hasSkill).length}/{selectedJob.preferredSkills.length} matched)
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {selectedJob.preferredSkills.map((skill, i) => {
                        const match = hasSkill(skill);
                        return (
                          <span key={i} style={chipStyle(match ? '#dbeafe' : '#f1f5f9', match ? '#1d4ed8' : '#94a3b8')}>
                            {match ? <CheckCircle size={12} /> : <span style={{ width: 12 }}>○</span>} {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Match progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>
                      <span>Overall Match</span>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>{skills.length > 0 ? Math.round(selectedJobMatch) : 0}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skills.length > 0 ? selectedJobMatch : 0}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: selectedJobMatch >= 70 ? '#16a34a' : selectedJobMatch >= 40 ? '#f59e0b' : '#ef4444',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== COLUMN 3: SUGGESTED ROLES ===== */}
        <div style={columnStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={columnHeaderStyle}>Best Matches</h2>
            <ThreeDotMenu
              id="suggested"
              options={[
                { label: 'Show all roles', icon: <RefreshCw size={14} />, action: () => setSelectedJobId('') },
              ]}
            />
          </div>

          {skills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
              <p style={{ fontWeight: '600' }}>Add your skills to see suggested roles!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobSuggestions.map((job, idx) => {
                const verdict = getVerdict(job.matchScore);
                const tagColor = chipColors[idx % chipColors.length];
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    style={cardStyle}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={chipStyle(tagColor.bg, tagColor.text)}>{job.title}</span>
                    </div>

                    {/* Verdict */}
                    <div style={{
                      background: verdict.bg, color: verdict.text,
                      padding: '0.5rem 0.85rem', borderRadius: '0.5rem',
                      fontWeight: '700', fontSize: '0.8rem',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}>
                      {verdict.icon} {verdict.label} — {Math.round(job.matchScore)}% match
                    </div>

                    {/* Required skills */}
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                        Required ({job.matchReq}/{job.requiredSkills.length})
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {job.requiredSkills.map((skill, i) => {
                          const match = hasSkill(skill);
                          return (
                            <span key={i} style={{ ...chipStyle(match ? '#dcfce7' : '#fee2e2', match ? '#16a34a' : '#dc2626'), padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                              {match ? '✓' : '✗'} {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Match bar */}
                    <div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${job.matchScore}%` }}
                          transition={{ duration: 0.7, delay: idx * 0.1 }}
                          style={{
                            height: '100%',
                            background: job.matchScore >= 70 ? '#16a34a' : job.matchScore >= 40 ? '#f59e0b' : '#ef4444',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobEligibility;
