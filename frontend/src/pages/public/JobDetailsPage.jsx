import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import Modal from '../../components/common/Modal';
import FileUpload from '../../components/profile/FileUpload';
import {
  FiMapPin,
  FiDollarSign,
  FiBriefcase,
  FiClock,
  FiUsers,
  FiBookmark,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { formatSalary, formatDate } from '../../utils/helpers';

const JobDetailsPage = () => {
  const { id } = useParams();
  const { user, isCandidate, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const data = await jobService.getJobDetails(id);
        setJob(data);
        setIsSaved(data.is_saved);
      } catch (err) {
        setError('Job details could not be loaded or the job is inactive.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const [saveLoading, setSaveLoading] = useState(false);

  const handleSaveToggle = async () => {
    if (!isCandidate || saveLoading) return;
    setSaveLoading(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved); // Optimistic UI update
    try {
      if (prevSaved) {
        await jobService.unsaveJob(id);
      } else {
        await jobService.saveJob(id);
      }
    } catch (err) {
      console.error('Save toggle error:', err);
      setIsSaved(prevSaved); // Revert on failure
    } finally {
      setSaveLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('job_id', id);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      if (coverLetter) {
        formData.append('cover_letter', coverLetter);
      }
      if (additionalInfo) {
        formData.append('additional_information', additionalInfo);
      }

      const res = await applicationService.applyForJob(formData);
      setApplySuccess(res);
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.resume?.[0] ||
        err.response?.data?.job_id?.[0] ||
        err.response?.data?.detail ||
        'Failed to submit application. Please verify your resume and details.';
      setApplyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '4rem 1.5rem' }}><LoadingState message="Loading position specifications..." /></div>;
  if (error || !job) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>{error || 'Job not found'}</h3>
        <Link to="/jobs" className="btn btn-outline">Back to Job Listings</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Breadcrumb / Back button */}
        <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <FiArrowLeft />
          Back to all jobs
        </Link>

        {/* Top Header Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  border: '1px solid #bfdbfe',
                }}
              >
                {job.company ? job.company[0].toUpperCase() : 'C'}
              </div>

              <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {job.company} {job.department && `• ${job.department}`}
                </span>
                <h1 style={{ fontSize: '1.85rem', marginTop: '0.2rem' }}>{job.title}</h1>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {isCandidate && (
                <button
                  onClick={handleSaveToggle}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  <FiBookmark fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Save Job'}
                </button>
              )}

              {isCandidate ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setApplyModalOpen(true)}
                >
                  Apply Now
                </button>
              ) : !isAuthenticated ? (
                <Link to="/candidate/login" className="btn btn-primary">
                  Sign In to Apply
                </Link>
              ) : null}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginTop: '1.75rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiMapPin color="var(--primary)" size={16} />
              {job.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiDollarSign color="var(--success)" size={16} />
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiBriefcase color="var(--purple)" size={16} />
              {job.experience_min} - {job.experience_max} yrs experience
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiUsers color="var(--info)" size={16} />
              {job.openings} Openings ({job.applicants_count || 0} applied)
            </span>
            {job.deadline && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiClock color="var(--warning)" size={16} />
                Deadline: {formatDate(job.deadline)}
              </span>
            )}
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-3" style={{ alignItems: 'flex-start' }}>
          {/* Main 2 columns: Description & Responsibilities */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Job Overview & Description</h3>
              <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7, color: 'var(--text-main)' }}>
                {job.description}
              </p>
            </div>

            {job.responsibilities && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Key Responsibilities</h3>
                <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7, color: 'var(--text-main)' }}>
                  {job.responsibilities}
                </p>
              </div>
            )}

            {job.qualifications && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Qualifications & Requirements</h3>
                <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7, color: 'var(--text-main)' }}>
                  {job.qualifications}
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar Column: Skills & Company */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Required Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {job.skills_list &&
                  job.skills_list.map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        fontSize: '0.825rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.85rem' }}>About {job.company}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Hiring manager: {job.recruiter_name}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                Posted on {formatDate(job.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setApplySuccess(null);
          setApplyError('');
        }}
        title={`Apply for ${job.title}`}
        maxWidth="600px"
        footer={
          !applySuccess && (
            <>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setApplyModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="apply-form"
                className="btn btn-primary btn-sm"
                disabled={submitting}
              >
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </>
          )
        }
      >
        {applySuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>
              <FiCheckCircle size={54} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Application Submitted!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been received with an algorithmic Resume Match Score of <strong>{applySuccess.match_score}%</strong>.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setApplyModalOpen(false);
                  navigate('/candidate/applications');
                }}
              >
                Track My Applications
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setApplyModalOpen(false);
                  navigate('/jobs');
                }}
              >
                Explore More Jobs
              </button>
            </div>
          </div>
        ) : (
          <form id="apply-form" onSubmit={handleApplySubmit}>
            {applyError && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger-text)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                }}
              >
                {applyError}
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <FileUpload
                onFileSelect={(file) => setResumeFile(file)}
                label="Resume / CV *"
                currentFileName={user?.candidate_profile?.resume_name || ''}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                If you do not select a new file, the resume saved in your candidate profile will be used.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Cover Letter (Optional)</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Introduce yourself and explain why you're a great fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Additional Information / Notice Period</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 2 weeks notice, willing to relocate, portfolio link"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default JobDetailsPage;
