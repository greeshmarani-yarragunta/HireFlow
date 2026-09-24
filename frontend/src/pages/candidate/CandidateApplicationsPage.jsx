import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import ApplicationCard from '../../components/applications/ApplicationCard';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { FiFileText, FiFilter } from 'react-icons/fi';
import { APPLICATION_STATUS } from '../../utils/constants';

const CandidateApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedStatus) params.status = selectedStatus;
        const data = await applicationService.getCandidateApplications(params);
        setApplications(data.results || data);
      } catch (err) {
        console.error('Failed to load candidate applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [selectedStatus]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.3rem' }}>My Applications</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Track the status of your submitted job applications in real time.
          </p>
        </div>
        <Link to="/jobs" className="btn btn-primary btn-sm">
          Browse More Jobs
        </Link>
      </div>

      {/* Filter Tabs */}
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
          className={`btn btn-sm ${selectedStatus === '' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSelectedStatus('')}
        >
          All
        </button>
        {Object.entries(APPLICATION_STATUS).map(([key, item]) => (
          <button
            key={key}
            className={`btn btn-sm ${selectedStatus === key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedStatus(key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Fetching your application history..." />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<FiFileText size={44} />}
          title="No applications found"
          description={selectedStatus ? `No applications currently have status '${selectedStatus}'.` : "You haven't applied for any positions yet."}
          actionText="Browse Open Jobs"
          onAction={() => window.location.href = '/jobs'}
        />
      ) : (
        <div className="grid grid-cols-2">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateApplicationsPage;
