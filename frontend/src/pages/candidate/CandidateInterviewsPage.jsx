import React, { useState, useEffect } from 'react';
import interviewService from '../../services/interviewService';
import InterviewCard from '../../components/interviews/InterviewCard';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { FiCalendar } from 'react-icons/fi';

const CandidateInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const data = await interviewService.getCandidateInterviews();
        setInterviews(data.results || data);
      } catch (err) {
        console.error('Failed to load candidate interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>My Interviews</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review scheduled technical discussions, HR rounds, and virtual meeting links.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading your interview schedule..." />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={<FiCalendar size={44} />}
          title="No scheduled interviews"
          description="When a recruiter shortlists your application and invites you for an interview, it will appear here."
        />
      ) : (
        <div className="grid grid-cols-2">
          {interviews.map((intv) => (
            <InterviewCard key={intv.id} interview={intv} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateInterviewsPage;
