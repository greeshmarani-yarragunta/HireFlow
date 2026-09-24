import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import {
  FiCalendar,
  FiClock,
  FiVideo,
  FiUser,
  FiExternalLink,
  FiCheckCircle,
} from 'react-icons/fi';

const InterviewCard = ({ interview, isRecruiter = false, onMarkCompleted }) => {
  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-body">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="badge badge-purple">{interview.interview_type} ROUND</span>
              <StatusBadge status={interview.status} type="interview" />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginTop: '0.3rem', color: 'var(--text-main)' }}>
              {isRecruiter ? interview.candidate_name : interview.job_title}
            </h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isRecruiter ? interview.job_title : interview.company_name}
            </span>
          </div>
        </div>

        {/* Date, Time & Interviewer */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
            <FiCalendar color="var(--primary)" size={15} />
            <span>{formatDate(interview.date)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
            <FiClock color="var(--primary)" size={15} />
            <span>{interview.time}</span>
          </div>
          {interview.interviewer && (
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <FiUser size={15} />
              <span>Interviewer: <strong>{interview.interviewer}</strong></span>
            </div>
          )}
        </div>

        {/* Notes if any */}
        {interview.notes && (
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '1rem' }}>
            <strong>Prep Notes:</strong> {interview.notes}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {interview.meeting_link ? (
          <a
            href={interview.meeting_link.startsWith('http') ? interview.meeting_link : `https://${interview.meeting_link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <FiVideo size={14} />
            Join Meeting
            <FiExternalLink size={12} />
          </a>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Meeting link to be provided</span>
        )}

        {isRecruiter && interview.status === 'SCHEDULED' && onMarkCompleted && (
          <button
            className="btn btn-success btn-sm"
            style={{ gap: '0.35rem' }}
            onClick={() => onMarkCompleted(interview.id)}
          >
            <FiCheckCircle size={14} />
            Mark Completed
          </button>
        )}
      </div>
    </div>
  );
};

export default InterviewCard;
