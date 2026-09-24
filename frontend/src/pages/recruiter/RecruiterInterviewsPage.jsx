import React, { useState, useEffect } from 'react';
import interviewService from '../../services/interviewService';
import InterviewCard from '../../components/interviews/InterviewCard';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { FiCalendar } from 'react-icons/fi';

const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await interviewService.getRecruiterInterviews(params);
      setInterviews(data.results || data);
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter]);

  const handleMarkCompleted = async (interviewId) => {
    try {
      await interviewService.updateInterview(interviewId, { status: 'COMPLETED' });
      fetchInterviews();
    } catch (err) {
      console.error('Failed to update interview:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Scheduled Interviews</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Conduct technical assessments and record progress on candidate interview rounds.
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
          All Interviews
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'SCHEDULED' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusFilter('SCHEDULED')}
        >
          Upcoming / Scheduled
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'COMPLETED' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setStatusFilter('COMPLETED')}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading scheduled interviews..." />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={<FiCalendar size={44} />}
          title="No interviews found"
          description="Schedule interviews directly from candidate applicant dossiers."
        />
      ) : (
        <div className="grid grid-cols-2">
          {interviews.map((intv) => (
            <InterviewCard
              key={intv.id}
              interview={intv}
              isRecruiter={true}
              onMarkCompleted={handleMarkCompleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviewsPage;
