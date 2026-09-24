import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import Modal from '../../components/common/Modal';
import { formatDate, formatSalary } from '../../utils/helpers';
import { FiCheck, FiX, FiSlash, FiBriefcase } from 'react-icons/fi';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalJob, setModalJob] = useState(null);
  const [actionType, setActionType] = useState('APPROVE');
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await adminService.getAdminJobs(params);
      setJobs(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleReviewAction = async () => {
    if (!modalJob) return;
    setActionLoading(true);
    try {
      await adminService.reviewJob(modalJob.id, actionType, feedback);
      setModalJob(null);
      setFeedback('');
      fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Job Moderation & Oversight</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review incoming employer postings, approve active roles, and disable non-compliant jobs.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <button className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('')}>
          All Postings
        </button>
        <button className={`btn btn-sm ${statusFilter === 'PENDING_APPROVAL' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('PENDING_APPROVAL')}>
          Pending Approval
        </button>
        <button className={`btn btn-sm ${statusFilter === 'ACTIVE' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('ACTIVE')}>
          Active
        </button>
        <button className={`btn btn-sm ${statusFilter === 'REJECTED' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('REJECTED')}>
          Rejected
        </button>
        <button className={`btn btn-sm ${statusFilter === 'DISABLED' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('DISABLED')}>
          Disabled
        </button>
      </div>

      {loading ? (
        <LoadingState message="Fetching all jobs across employers..." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Job Title & Company</th>
                <th>Recruiter</th>
                <th>Type</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <strong>{job.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.company} • {job.location}</div>
                  </td>
                  <td>{job.recruiter_name}</td>
                  <td><span className="badge badge-gray">{job.job_type}</span></td>
                  <td>
                    <StatusBadge status={job.status} type="job" />
                  </td>
                  <td>{formatDate(job.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {job.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            style={{ gap: '0.2rem' }}
                            onClick={() => { setModalJob(job); setActionType('APPROVE'); }}
                          >
                            <FiCheck size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ gap: '0.2rem' }}
                            onClick={() => { setModalJob(job); setActionType('REJECT'); }}
                          >
                            <FiX size={14} /> Reject
                          </button>
                        </>
                      )}

                      {job.status === 'ACTIVE' && (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ gap: '0.2rem', color: 'var(--danger)' }}
                          onClick={() => { setModalJob(job); setActionType('DISABLE'); }}
                        >
                          <FiSlash size={14} /> Disable
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

      {/* Review Modal */}
      <Modal
        isOpen={!!modalJob}
        onClose={() => setModalJob(null)}
        title={`${actionType === 'APPROVE' ? 'Approve' : actionType === 'REJECT' ? 'Reject' : 'Disable'} Job: ${modalJob?.title}`}
        maxWidth="500px"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setModalJob(null)} disabled={actionLoading}>
              Cancel
            </button>
            <button
              className={`btn ${actionType === 'APPROVE' ? 'btn-success' : 'btn-danger'} btn-sm`}
              onClick={handleReviewAction}
              disabled={actionLoading}
            >
              {actionLoading ? 'Updating...' : `Confirm ${actionType}`}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Feedback / Reason (Sent to Recruiter)</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Add explanation for this moderation decision..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminJobsPage;
