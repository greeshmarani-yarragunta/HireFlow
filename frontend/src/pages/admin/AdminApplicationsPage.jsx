import React, { useState, useEffect } from 'react';
import applicationService from '../../services/applicationService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import { formatDate, getMatchColor } from '../../utils/helpers';
import { APPLICATION_STATUS } from '../../utils/constants';

const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const data = await applicationService.getAdminApplications(params);
        setApplications(data.results || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [statusFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Platform Applications</h1>
          <p style={{ color: 'var(--text-muted)' }}>Complete audit log of all candidate submissions across organizations.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <button className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('')}>
          All
        </button>
        {Object.entries(APPLICATION_STATUS).map(([k, item]) => (
          <button key={k} className={`btn btn-sm ${statusFilter === k ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter(k)}>
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading applications..." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Target Job & Company</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Applied Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.candidate?.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.candidate?.email}</div>
                  </td>
                  <td>
                    <strong>{app.job?.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.job?.company}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: getMatchColor(app.match_score) }}>
                      {app.match_score}%
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={app.status} type="application" />
                  </td>
                  <td>{formatDate(app.applied_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsPage;
