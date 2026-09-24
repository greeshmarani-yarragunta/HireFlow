import React from 'react';
import { FiCheck, FiX, FiAlertCircle, FiAward } from 'react-icons/fi';
import { getMatchColor } from '../../utils/helpers';

const ResumeMatchCard = ({ matchAnalysis, matchScore }) => {
  if (!matchAnalysis) {
    return (
      <div className="card" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiAward color="var(--primary)" />
          Resume Match Analysis
        </h4>
        <div className="match-meter-container mt-2">
          <div className="match-bar-bg">
            <div
              className="match-bar-fill"
              style={{
                width: `${matchScore || 0}%`,
                backgroundColor: getMatchColor(matchScore || 0),
              }}
            />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: getMatchColor(matchScore || 0) }}>
            {matchScore || 0}%
          </span>
        </div>
      </div>
    );
  }

  const score = matchAnalysis.match_score ?? matchScore ?? 0;
  const scoreColor = getMatchColor(score);

  return (
    <div className="card" style={{ padding: '1.5rem', border: `1px solid ${scoreColor}40` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <FiAward color={scoreColor} size={20} />
            Resume Match Analysis
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Algorithmic comparison against required job skills
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
            {score}%
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Match Score
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="match-bar-bg" style={{ height: '12px', marginBottom: '1.5rem' }}>
        <div
          className="match-bar-fill"
          style={{
            width: `${score}%`,
            backgroundColor: scoreColor,
          }}
        />
      </div>

      {/* Statistics summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          backgroundColor: 'var(--bg-subtle)',
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {matchAnalysis.required_skills_count ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required Skills</div>
        </div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>
            {matchAnalysis.matched_skills_count ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matched</div>
        </div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger)' }}>
            {matchAnalysis.missing_skills ? matchAnalysis.missing_skills.length : 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Missing</div>
        </div>
      </div>

      {/* Matched Skills */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success-text)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FiCheck size={16} />
          Matched Skills ({matchAnalysis.matched_skills?.length || 0})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {matchAnalysis.matched_skills && matchAnalysis.matched_skills.length > 0 ? (
            matchAnalysis.matched_skills.map((skill, i) => (
              <span key={i} className="skill-chip skill-chip-matched">
                <FiCheck size={12} />
                {skill}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No direct keyword matches found.</span>
          )}
        </div>
      </div>

      {/* Missing Skills */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger-text)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FiX size={16} />
          Missing Required Skills ({matchAnalysis.missing_skills?.length || 0})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {matchAnalysis.missing_skills && matchAnalysis.missing_skills.length > 0 ? (
            matchAnalysis.missing_skills.map((skill, i) => (
              <span key={i} className="skill-chip skill-chip-missing">
                <FiX size={12} />
                {skill}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Candidate meets all required skills!</span>
          )}
        </div>
      </div>

      {/* Transparent Disclaimer */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--info-light)',
          color: 'var(--info-text)',
          fontSize: '0.75rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start',
          lineHeight: 1.4,
        }}
      >
        <FiAlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          {matchAnalysis.disclaimer ||
            'Resume match score is an algorithmic keyword-based indicator to assist review and does not guarantee hiring suitability.'}
        </span>
      </div>
    </div>
  );
};

export default ResumeMatchCard;
