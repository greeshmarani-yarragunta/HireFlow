import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiClock,
  FiBookmark,
  FiArrowRight,
} from 'react-icons/fi';
import { formatSalary, formatDate } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';

const JobCard = ({ job, onSaveToggle, isSaved = false }) => {
  const { isCandidate } = useAuth();

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header: Company & Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 700,
                border: '1px solid #bfdbfe',
                flexShrink: 0,
              }}
            >
              {job.company ? job.company[0].toUpperCase() : 'C'}
            </div>
            <div>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {job.company}
              </span>
              <h3 style={{ fontSize: '1.1rem', marginTop: '0.15rem' }}>
                <Link to={`/jobs/${job.id}`} style={{ color: 'var(--text-main)' }}>
                  {job.title}
                </Link>
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StatusBadge status={job.job_type} type="job_type" />
            {isCandidate && onSaveToggle && (
              <button
                onClick={() => onSaveToggle(job.id)}
                style={{
                  background: isSaved ? 'var(--primary-light)' : 'transparent',
                  border: '1px solid var(--border)',
                  color: isSaved ? 'var(--primary)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-md)',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                aria-label={isSaved ? 'Remove saved job' : 'Save job'}
              >
                <FiBookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>

        {/* Location & Meta Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.85rem',
            marginBottom: '1rem',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FiMapPin size={14} color="var(--primary)" />
            {job.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FiDollarSign size={14} color="var(--success)" />
            {formatSalary(job.salary_min, job.salary_max)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FiBriefcase size={14} color="var(--purple)" />
            {job.experience_min} - {job.experience_max} yrs exp
          </span>
          {job.deadline && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FiClock size={14} color="var(--warning)" />
              Apply by {formatDate(job.deadline)}
            </span>
          )}
        </div>

        {/* Short description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1.25rem',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {job.description}
        </p>

        {/* Required Skills Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto' }}>
          {job.skills_list &&
            job.skills_list.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--secondary)',
                  padding: '0.25rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {skill}
              </span>
            ))}
          {job.skills_list && job.skills_list.length > 4 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', alignSelf: 'center' }}>
              +{job.skills_list.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
          Posted {formatDate(job.created_at)}
        </span>
        <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm" style={{ gap: '0.4rem' }}>
          View Details
          <FiArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
