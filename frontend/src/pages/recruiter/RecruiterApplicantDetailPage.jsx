import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import interviewService from '../../services/interviewService';
import StatusBadge from '../../components/common/StatusBadge';
import ResumeMatchCard from '../../components/applications/ResumeMatchCard';
import ScheduleInterviewModal from '../../components/interviews/ScheduleInterviewModal';
import LoadingState from '../../components/common/LoadingState';
import { formatDate } from '../../utils/helpers';
import { APPLICATION_STATUS } from '../../utils/constants';
import {
  FiArrowLeft,
  FiDownload,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiUser,
} from 'react-icons/fi';

const RecruiterApplicantDetailPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusErr, setStatusErr] = useState('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getRecruiterApplicantDetails(id);
      setApplication(data);
    } catch (err) {
      setError('Failed to load applicant dossier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusTransition = async (newStatus) => {
    setStatusUpdating(true);
    setStatusMsg('');
    setStatusErr('');

    try {
      await applicationService.updateApplicantStatus(id, newStatus);
      setStatusMsg(`Application transitioned to ${newStatus}`);
      fetchDetail();
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.status?.[0] || err.response?.data?.error || 'Invalid status transition.';
      setStatusErr(msg);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleInterviewScheduled = async (interviewData) => {
    await interviewService.scheduleInterview(interviewData);
    fetchDetail();
  };

  if (loading) return <LoadingState message="Loading applicant dossier..." />;
  if (error || !application) {
    return (
      <div>
        <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error || 'Applicant not found'}</h3>
        <Link to="/recruiter/applicants" className="btn btn-outline btn-sm">Back to Applicants</Link>
      </div>
    );
  }

  const candidate = application.candidate || {};

  return (
    <div>
      <Link
        to="/recruiter/applicants"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}
      >
        <FiArrowLeft />
        Back to Applicants
      </Link>

      {/* Top Header Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--purple-light)',
                color: 'var(--purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 700,
              }}
            >
              {candidate.name?.[0]?.toUpperCase()}
            </div>

            <div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>{candidate.name}</h1>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiMail /> {candidate.email}</span>
                {candidate.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiPhone /> {candidate.phone}</span>}
                {candidate.location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiMapPin /> {candidate.location}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Status:</span>
              <StatusBadge status={application.status} type="application" />
            </div>

            {application.resume && (
              <a
                href={application.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <FiDownload size={14} />
                Download Resume File
              </a>
            )}
          </div>
        </div>

        {/* Status Transition Action Bar */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginRight: '0.5rem' }}>
              Pipeline Action:
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Target Role: <strong>{application.job?.title}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {application.status === 'APPLIED' && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleStatusTransition('UNDER_REVIEW')}
                disabled={statusUpdating}
              >
                Move to Under Review
              </button>
            )}

            {(application.status === 'APPLIED' || application.status === 'UNDER_REVIEW') && (
              <button
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: 'var(--purple)' }}
                onClick={() => handleStatusTransition('SHORTLISTED')}
                disabled={statusUpdating}
              >
                Shortlist Candidate
              </button>
            )}

            {(application.status === 'SHORTLISTED' || application.status === 'INTERVIEW_SCHEDULED' || application.status === 'UNDER_REVIEW') && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setScheduleModalOpen(true)}
              >
                📅 Schedule Interview Round
              </button>
            )}

            {application.status === 'INTERVIEW_SCHEDULED' && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleStatusTransition('INTERVIEW_COMPLETED')}
                disabled={statusUpdating}
              >
                Mark Interview Completed
              </button>
            )}

            {application.status === 'INTERVIEW_COMPLETED' && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleStatusTransition('SELECTED')}
                disabled={statusUpdating}
              >
                ✓ Select / Hire Candidate
              </button>
            )}

            {application.status !== 'REJECTED' && application.status !== 'SELECTED' && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleStatusTransition('REJECTED')}
                disabled={statusUpdating}
              >
                Reject Candidate
              </button>
            )}
          </div>
        </div>

        {statusMsg && (
          <div style={{ marginTop: '1rem', color: 'var(--success-text)', fontSize: '0.85rem', fontWeight: 600 }}>
            ✓ {statusMsg}
          </div>
        )}
        {statusErr && (
          <div style={{ marginTop: '1rem', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
            ⚠ {statusErr}
          </div>
        )}
      </div>

      {/* Grid: Resume Match Analysis & Candidate Profile */}
      <div className="grid grid-cols-2" style={{ alignItems: 'flex-start' }}>
        {/* Left Column: Match Analysis */}
        <ResumeMatchCard
          matchAnalysis={application.match_analysis}
          matchScore={application.match_score}
        />

        {/* Right Column: Background & Candidate Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUser color="var(--primary)" />
              Candidate Background
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Degree / Education:</span>
                <div style={{ fontWeight: 600 }}>{candidate.degree || candidate.education || 'Not specified'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Institution:</span>
                <div style={{ fontWeight: 600 }}>{candidate.institution || 'Not specified'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Graduation Year:</span>
                <div style={{ fontWeight: 600 }}>{candidate.graduation_year || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Experience:</span>
                <div style={{ fontWeight: 600 }}>{candidate.experience ?? 0} years</div>
              </div>
            </div>

            {candidate.bio && (
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Professional Bio:</span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                  {candidate.bio}
                </p>
              </div>
            )}

            {candidate.skills && (
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Candidate Profile Skills:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.3rem' }}>
                  {candidate.skills.split(',').map((s, idx) => (
                    <span key={idx} className="badge badge-gray">{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {candidate.projects && (
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Notable Projects:</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {candidate.projects}
                </p>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          {application.cover_letter && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Cover Letter</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {application.cover_letter}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        application={application}
        onScheduled={handleInterviewScheduled}
      />
    </div>
  );
};

export default RecruiterApplicantDetailPage;
