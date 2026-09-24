import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import StatusBadge from '../../components/common/StatusBadge';
import ResumeMatchCard from '../../components/applications/ResumeMatchCard';
import InterviewCard from '../../components/interviews/InterviewCard';
import LoadingState from '../../components/common/LoadingState';
import { formatDate } from '../../utils/helpers';
import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiDownload,
  FiCheckCircle,
} from 'react-icons/fi';

const CandidateApplicationDetailPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await applicationService.getCandidateApplicationDetails(id);
        setApplication(data);
      } catch (err) {
        setError('Failed to load application details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <LoadingState message="Loading application details..." />;
  if (error || !application) {
    return (
      <div>
        <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error || 'Application not found'}</h3>
        <Link to="/candidate/applications" className="btn btn-outline btn-sm">
          Back to Applications
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW_SCHEDULED', label: 'Interview' },
    { key: 'SELECTED', label: 'Decision' },
  ];

  const getStepStatus = (stepKey) => {
    const order = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED'];
    const currentIdx = order.indexOf(application.status);
    const stepIdx = order.indexOf(stepKey);

    if (application.status === 'REJECTED') {
      return 'rejected';
    }
    if (stepIdx <= currentIdx) {
      return 'completed';
    }
    return 'pending';
  };

  return (
    <div>
      {/* Back button */}
      <Link
        to="/candidate/applications"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}
      >
        <FiArrowLeft />
        Back to my applications
      </Link>

      {/* Main Header Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {application.job?.company}
            </span>
            <h1 style={{ fontSize: '1.75rem', marginTop: '0.2rem', color: 'var(--text-main)' }}>
              {application.job?.title}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Applied on {formatDate(application.applied_at)}</span>
              <span>📍 {application.job?.location}</span>
            </div>
          </div>

          <StatusBadge status={application.status} type="application" />
        </div>

        {/* Status Stepper Progression */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '1rem' }}>
            Hiring Pipeline Progress
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {steps.map((st, i) => {
              const status = getStepStatus(st.key);
              let circleBg = 'var(--bg-subtle)';
              let circleColor = 'var(--text-muted)';
              if (status === 'completed') {
                circleBg = 'var(--primary)';
                circleColor = 'white';
              } else if (status === 'rejected' && i === steps.length - 1) {
                circleBg = 'var(--danger)';
                circleColor = 'white';
              }

              return (
                <div key={st.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: circleBg,
                      color: circleColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      marginBottom: '0.4rem',
                      boxShadow: status === 'completed' ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none',
                    }}
                  >
                    {status === 'completed' ? <FiCheckCircle size={16} /> : i + 1}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: status === 'completed' ? 'var(--text-main)' : 'var(--text-muted)', textAlign: 'center' }}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Resume Match Analysis & Candidate Details */}
      <div className="grid grid-cols-2" style={{ alignItems: 'flex-start' }}>
        {/* Left Column: Resume Match Analysis */}
        <ResumeMatchCard
          matchAnalysis={application.match_analysis}
          matchScore={application.match_score}
        />

        {/* Right Column: Submitted Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Submitted Documents */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFileText color="var(--primary)" />
              Submitted Application Materials
            </h4>

            {application.resume && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {application.resume_name || 'Resume Document'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attached at submission</div>
                </div>

                <a
                  href={application.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <FiDownload size={14} />
                  Download
                </a>
              </div>
            )}

            {application.cover_letter && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Cover Letter
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', whiteSpace: 'pre-line', lineHeight: 1.6, backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  {application.cover_letter}
                </p>
              </div>
            )}

            {application.additional_information && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Additional Notes
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  {application.additional_information}
                </p>
              </div>
            )}
          </div>

          {/* Job Details Quick Link */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Original Job Posting</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Review full role description, responsibilities, and team expectations.
            </p>
            <Link to={`/jobs/${application.job?.id}`} className="btn btn-outline btn-sm">
              View Role Specification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateApplicationDetailPage;
