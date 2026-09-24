import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import {
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiCheck,
  FiX,
  FiAlertTriangle,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalJob, setReviewModalJob] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleReviewSubmit = async () => {
    if (!reviewModalJob) return;
    setActionLoading(true);
    try {
      await adminService.reviewJob(reviewModalJob.id, reviewAction, adminFeedback);
      setReviewModalJob(null);
      setAdminFeedback('');
      fetchDashboard();
    } catch (err) {
      console.error('Failed to review job:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Aggregating platform intelligence..." />;

  const stats = data?.stats || {};
  const pendingJobs = data?.pending_jobs || [];
  const recentApps = data?.recent_applications || [];
  const analytics = data?.analytics || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Platform Control Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            System-wide analytics, job moderation queue, and user management.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-4 mb-6">
        <StatCard
          title="Total Users"
          value={stats.total_users}
          icon={<FiUsers />}
          color="var(--primary)"
          bg="var(--primary-light)"
          trend={`${stats.candidates || 0} Cand. / ${stats.recruiters || 0} Empl.`}
        />
        <StatCard
          title="Active Jobs"
          value={stats.active_jobs}
          icon={<FiBriefcase />}
          color="var(--success-text)"
          bg="var(--success-light)"
          trend={`Total: ${stats.total_jobs || 0}`}
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending_jobs}
          icon={<FiClock />}
          color="var(--warning-text)"
          bg="var(--warning-light)"
          trend="Requires admin review"
        />
        <StatCard
          title="Total Applications"
          value={stats.total_applications}
          icon={<FiFileText />}
          color="var(--purple)"
          bg="var(--purple-light)"
          trend={`${stats.selected_candidates || 0} Placed`}
        />
      </div>

      {/* Pending Job Approvals Queue */}
      <div className="card mb-6">
        <div className="card-header" style={{ backgroundColor: 'var(--warning-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiClock color="var(--warning-text)" size={18} />
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--warning-text)' }}>
              Job Postings Awaiting Approval ({pendingJobs.length})
            </h3>
          </div>
          <Link to="/admin/jobs" className="btn btn-outline btn-sm">
            View All Jobs
          </Link>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          {pendingJobs.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              ✓ All job submissions have been reviewed! No pending approvals.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Recruiter</th>
                  <th>Submitted</th>
                  <th>Required Skills</th>
                  <th>Decision Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.location}</div>
                    </td>
                    <td>{job.company}</td>
                    <td>{job.recruiter_name}</td>
                    <td>{formatDate(job.created_at)}</td>
                    <td>
                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                        {job.required_skills}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-success btn-sm"
                          style={{ gap: '0.2rem' }}
                          onClick={() => {
                            setReviewModalJob(job);
                            setReviewAction('APPROVE');
                          }}
                        >
                          <FiCheck size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ gap: '0.2rem' }}
                          onClick={() => {
                            setReviewModalJob(job);
                            setReviewAction('REJECT');
                          }}
                        >
                          <FiX size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Analytics Breakdown & Recent Applications */}
      <div className="grid grid-cols-2 mb-6" style={{ alignItems: 'flex-start' }}>
        {/* Pipeline Analytics */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Platform Pipeline Metrics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(analytics.application_status_breakdown || {}).map(([st, count]) => (
              <div key={st}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>{st.replace('_', ' ')}</span>
                  <span>{count} applications</span>
                </div>
                <div className="match-bar-bg" style={{ height: '8px' }}>
                  <div
                    className="match-bar-fill"
                    style={{
                      width: `${stats.total_applications > 0 ? (count / stats.total_applications) * 100 : 0}%`,
                      backgroundColor: 'var(--primary)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications Across Platform */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Recent Platform Applications</h3>
            <Link to="/admin/applications" className="btn btn-outline btn-sm">
              All Applications
            </Link>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentApps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                No applications on platform yet.
              </div>
            ) : (
              recentApps.map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.9rem', margin: 0 }}>
                      {app.candidate?.name} → {app.job?.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {app.job?.company} • Match: {app.match_score}%
                    </span>
                  </div>
                  <StatusBadge status={app.status} type="application" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Job Modal */}
      <Modal
        isOpen={!!reviewModalJob}
        onClose={() => setReviewModalJob(null)}
        title={`${reviewAction === 'APPROVE' ? 'Approve' : 'Reject'} Job: ${reviewModalJob?.title}`}
        maxWidth="500px"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setReviewModalJob(null)} disabled={actionLoading}>
              Cancel
            </button>
            <button
              className={`btn ${reviewAction === 'APPROVE' ? 'btn-success' : 'btn-danger'} btn-sm`}
              onClick={handleReviewSubmit}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : reviewAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          {reviewAction === 'APPROVE'
            ? `Approving this job will immediately make it ACTIVE and visible to candidates in public search.`
            : `Rejecting this job will set its status to REJECTED and alert the recruiter.`}
        </p>

        <div className="form-group">
          <label className="form-label">Administrator Feedback / Reason</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder={
              reviewAction === 'APPROVE'
                ? 'Optional feedback to recruiter...'
                : 'Explain what guidelines or details require amendment...'
            }
            value={adminFeedback}
            onChange={(e) => setAdminFeedback(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
