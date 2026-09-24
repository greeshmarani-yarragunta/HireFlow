import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getMatchColor } from '../../utils/helpers';
import {
  FiBriefcase,
  FiUsers,
  FiAward,
  FiCalendar,
  FiPlusCircle,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/recruiter/dashboard/');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading recruiter metrics and applicant pipelines..." />;

  const stats = data?.stats || {};
  const analytics = data?.analytics || {};
  const recentApplicants = data?.recent_applicants || [];
  const activeJobs = data?.active_jobs || [];
  const upcomingInterviews = data?.upcoming_interviews || [];

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
            Employer Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Overview of openings, incoming candidate pipelines, and scheduled interview rounds.
          </p>
        </div>

        <Link to="/recruiter/jobs/create" className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <FiPlusCircle size={16} />
          Create New Job
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 mb-6">
        <StatCard
          title="Active Jobs"
          value={stats.active_jobs}
          icon={<FiBriefcase />}
          color="var(--primary)"
          bg="var(--primary-light)"
        />
        <StatCard
          title="Total Applicants"
          value={stats.total_applicants}
          icon={<FiUsers />}
          color="var(--purple)"
          bg="var(--purple-light)"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          icon={<FiAward />}
          color="var(--warning-text)"
          bg="var(--warning-light)"
        />
        <StatCard
          title="Scheduled Interviews"
          value={stats.interviews}
          icon={<FiCalendar />}
          color="var(--success-text)"
          bg="var(--success-light)"
        />
      </div>

      {/* Analytics Visual Breakdown */}
      <div className="grid grid-cols-3 mb-6" style={{ alignItems: 'flex-start' }}>
        {/* Pipeline Status Distribution */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Applicant Pipeline Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(analytics.status_breakdown || {}).map(([st, cnt]) => (
              <div key={st}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600 }}>{st.replace('_', ' ')}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{cnt} candidates</span>
                </div>
                <div className="match-bar-bg" style={{ height: '8px' }}>
                  <div
                    className="match-bar-fill"
                    style={{
                      width: `${stats.total_applicants > 0 ? (cnt / stats.total_applicants) * 100 : 0}%`,
                      backgroundColor:
                        st === 'SELECTED'
                          ? 'var(--success)'
                          : st === 'SHORTLISTED'
                          ? 'var(--purple)'
                          : st === 'INTERVIEW_SCHEDULED'
                          ? 'var(--primary)'
                          : 'var(--text-light)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs by Department */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Jobs by Department</h3>
          {analytics.department_breakdown?.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
              No department data yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analytics.department_breakdown?.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.department}</span>
                  <span className="badge badge-blue">{item.count} jobs</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Volume Trend */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Last 7 Days Applications</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', paddingTop: '1rem' }}>
            {analytics.daily_applications?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.4rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{item.count}</div>
                <div
                  style={{
                    width: '18px',
                    height: `${Math.max(8, item.count * 25)}px`,
                    backgroundColor: 'var(--primary)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{item.date.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Recent Applicants & Active Jobs */}
      <div className="grid grid-cols-2 mb-6" style={{ alignItems: 'flex-start' }}>
        {/* Recent Applicants */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Recent Candidates</h3>
            <Link to="/recruiter/applicants" className="btn btn-outline btn-sm">
              View All ({stats.total_applicants || 0})
            </Link>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            {recentApplicants.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No applications submitted yet.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role</th>
                    <th>Match Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplicants.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.candidate?.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.candidate?.email}</div>
                      </td>
                      <td>{app.job?.title}</td>
                      <td>
                        <span style={{ fontWeight: 800, color: getMatchColor(app.match_score) }}>
                          {app.match_score}%
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={app.status} type="application" />
                      </td>
                      <td>
                        <Link to={`/recruiter/applicants/${app.id}`} className="btn btn-outline btn-sm">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Active Job Postings */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Active Job Postings</h3>
            <Link to="/recruiter/jobs" className="btn btn-outline btn-sm">
              Manage All Jobs ({stats.total_jobs || 0})
            </Link>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeJobs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active jobs. Create a job to start receiving applicants.
              </div>
            ) : (
              activeJobs.map((j) => (
                <div
                  key={j.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{j.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {j.department || 'Engineering'} • {j.applicants_count || 0} applicants
                    </span>
                  </div>
                  <Link to={`/recruiter/applicants?job_id=${j.id}`} className="btn btn-outline btn-sm">
                    Applicants
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
