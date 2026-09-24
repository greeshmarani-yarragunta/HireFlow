import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jobService from '../../services/jobService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatSalary } from '../../utils/helpers';
import { FiPlusCircle, FiUsers, FiEdit2, FiBriefcase, FiCheckCircle } from 'react-icons/fi';

const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await jobService.getRecruiterJobs(params);
      setJobs(data.results || data);
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobService.patchJob(jobId, { status: newStatus });
      fetchJobs();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Job Postings</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage created positions, review applicant volumes, and request administrative approval.
          </p>
        </div>

        <Link to="/recruiter/jobs/create" className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <FiPlusCircle size={16} />
          Create New Job
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusFilter('')}
        >
          All Postings
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'ACTIVE' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusFilter('ACTIVE')}
        >
          Active
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'PENDING_APPROVAL' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusFilter('PENDING_APPROVAL')}
        >
          Pending Admin Review
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'DRAFT' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusFilter('DRAFT')}
        >
          Drafts
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'CLOSED' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusFilter('CLOSED')}
        >
          Closed
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading your job postings..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<FiBriefcase size={44} />}
          title="No jobs found"
          description="Create a new job posting to start receiving qualified applicants."
          actionText="Create New Job"
          onAction={() => (window.location.href = '/recruiter/jobs/create')}
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Department</th>
                <th>Type</th>
                <th>Salary Range</th>
                <th>Status</th>
                <th>Applicants</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <strong>{job.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.location}</div>
                  </td>
                  <td>{job.department || 'General'}</td>
                  <td>
                    <span className="badge badge-gray">{job.job_type}</span>
                  </td>
                  <td>{formatSalary(job.salary_min, job.salary_max)}</td>
                  <td>
                    <StatusBadge status={job.status} type="job" />
                    {job.status === 'REJECTED' && job.admin_feedback && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
                        Note: {job.admin_feedback}
                      </div>
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/recruiter/applicants?job_id=${job.id}`}
                      className="btn btn-outline btn-sm"
                      style={{ gap: '0.3rem' }}
                    >
                      <FiUsers size={13} />
                      {job.applicants_count || 0}
                    </Link>
                  </td>
                  <td>{formatDate(job.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link to={`/recruiter/jobs/${job.id}`} className="btn btn-outline btn-sm" title="Edit Job">
                        <FiEdit2 size={13} />
                      </Link>

                      {job.status === 'DRAFT' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStatusChange(job.id, 'PENDING_APPROVAL')}
                          title="Submit for Approval"
                        >
                          Submit
                        </button>
                      )}

                      {job.status === 'ACTIVE' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStatusChange(job.id, 'CLOSED')}
                          title="Close Job"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobsPage;
