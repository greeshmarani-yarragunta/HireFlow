import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatDate, getMatchColor } from '../../utils/helpers';
import { FiArrowRight, FiUser, FiCalendar, FiAward } from 'react-icons/fi';

const ApplicationCard = ({ application, isRecruiterView = false }) => {
  const matchColor = getMatchColor(application.match_score);
  const detailLink = isRecruiterView
    ? `/recruiter/applicants/${application.id}`
    : `/candidate/applications/${application.id}`;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-body">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', margin: 0 }}>
              <Link to={detailLink} style={{ color: 'var(--text-main)' }}>
                {isRecruiterView ? application.candidate?.name : application.job?.title}
              </Link>
            </h4>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {isRecruiterView ? application.job?.title : application.job?.company}
            </span>
          </div>

          <StatusBadge status={application.status} type="application" />
        </div>

        {/* Candidate or Job meta details */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <FiCalendar size={13} />
            Applied on {formatDate(application.applied_at)}
          </span>
          {isRecruiterView && application.candidate?.location && (
            <span>📍 {application.candidate.location}</span>
          )}
          {isRecruiterView && (
            <span>💼 {application.candidate.experience ?? 0} yrs exp</span>
          )}
        </div>

        {/* Resume Match Score Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            borderLeft: `4px solid ${matchColor}`,
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <FiAward color={matchColor} size={15} />
            Resume Match Score
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: matchColor }}>
            {application.match_score}%
          </span>
        </div>
      </div>

      <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link to={detailLink} className="btn btn-outline btn-sm" style={{ gap: '0.4rem' }}>
          {isRecruiterView ? 'Review Application' : 'Track Status'}
          <FiArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

export default ApplicationCard;
