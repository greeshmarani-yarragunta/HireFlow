import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, getMatchColor } from '../../utils/helpers';
import { APPLICATION_STATUS } from '../../utils/constants';
import { FiUsers, FiAward, FiEye } from 'react-icons/fi';

const RecruiterApplicantsPage = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job_id');

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const params = {};
        if (jobId) params.job_id = jobId;
        if (statusFilter) params.status = statusFilter;
        const data = await applicationService.getRecruiterApplicants(params);
        setApplicants(data.results || data);
      } catch (err) {
        console.error('Failed to load applicants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [jobId, statusFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Applicant Dossiers</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Review candidate resumes, inspect algorithmic skill matching, and manage pipeline progression.
          </p>
        </div>
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
          className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusFilter('')}
        >
          All Applicants
        </button>
        {Object.entries(APPLICATION_STATUS).map(([k, item]) => (
          <button
            key={k}
            className={`btn btn-sm ${statusFilter === k ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter(k)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Fetching applicant submissions..." />
      ) : applicants.length === 0 ? (
        <EmptyState
          icon={<FiUsers size={44} />}
          title="No applicants found"
          description={
            statusFilter
              ? `No candidates currently under status '${statusFilter}'.`
              : 'No candidates have applied for these positions yet.'
          }
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Target Job</th>
                <th>Match Score</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {app.candidate?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <strong>{app.candidate?.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {app.candidate?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{app.job?.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.job?.company}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiAward color={getMatchColor(app.match_score)} />
                      <strong style={{ color: getMatchColor(app.match_score), fontSize: '1rem' }}>
                        {app.match_score}%
                      </strong>
                    </div>
                  </td>
                  <td>{app.candidate?.experience ?? 0} yrs</td>
                  <td>
                    <StatusBadge status={app.status} type="application" />
                  </td>
                  <td>{formatDate(app.applied_at)}</td>
                  <td>
                    <Link
                      to={`/recruiter/applicants/${app.id}`}
                      className="btn btn-outline btn-sm"
                      style={{ gap: '0.35rem' }}
                    >
                      <FiEye size={13} />
                      Review
                    </Link>
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

export default RecruiterApplicantsPage;
