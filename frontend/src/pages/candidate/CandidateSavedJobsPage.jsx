import React, { useState, useEffect } from 'react';
import jobService from '../../services/jobService';
import JobCard from '../../components/jobs/JobCard';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { FiBookmark } from 'react-icons/fi';

const CandidateSavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const data = await jobService.getSavedJobs();
      setSavedJobs(data.results || data);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await jobService.unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job?.id !== jobId));
    } catch (err) {
      console.error('Failed to remove saved job:', err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Saved Opportunities</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review and quickly apply to positions you bookmarked earlier.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Fetching your saved jobs..." />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={<FiBookmark size={44} />}
          title="No saved jobs yet"
          description="Click the bookmark icon on any job card to save it for quick review and application."
          actionText="Browse Available Jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="grid grid-cols-2">
          {savedJobs.map((item) => (
            <JobCard
              key={item.id}
              job={item.job}
              isSaved={true}
              onSaveToggle={handleUnsave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateSavedJobsPage;
