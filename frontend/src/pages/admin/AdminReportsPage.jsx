import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import LoadingState from '../../components/common/LoadingState';
import { FiBarChart2, FiAward, FiCheckCircle, FiUsers, FiBriefcase } from 'react-icons/fi';

const AdminReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await adminService.getDashboardStats();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <LoadingState message="Generating analytical reports..." />;

  const stats = data?.stats || {};
  const analytics = data?.analytics || {};

  return (
    <div style={{ maxWidth: '950px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Platform Intelligence & Reports</h1>
        <p style={{ color: 'var(--text-muted)' }}>High-level insights into recruitment velocity, placement ratios, and talent supply.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 mb-6">
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><FiUsers size={24} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.total_users || 0}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Platform Users</div>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ color: 'var(--warning-text)', marginBottom: '0.5rem' }}><FiBriefcase size={24} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.active_jobs || 0}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live Openings</div>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ color: 'var(--success)', marginBottom: '0.5rem' }}><FiCheckCircle size={24} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.selected_candidates || 0}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Successful Candidate Hires</div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="card mb-6" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiBarChart2 color="var(--primary)" />
          Application Progression Funnel
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(analytics.application_status_breakdown || {}).map(([status, count]) => {
            const pct = stats.total_applications > 0 ? ((count / stats.total_applications) * 100).toFixed(1) : 0;
            return (
              <div key={status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>{status.replace('_', ' ')}</span>
                  <span>{count} applications ({pct}%)</span>
                </div>
                <div className="match-bar-bg" style={{ height: '10px' }}>
                  <div className="match-bar-fill" style={{ width: `${pct}%`, backgroundColor: status === 'SELECTED' ? 'var(--success)' : 'var(--primary)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Employment Type Distribution</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {analytics.job_type_distribution?.map((item, idx) => (
            <div key={idx} style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', flex: 1, minWidth: '150px' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{item.count}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
