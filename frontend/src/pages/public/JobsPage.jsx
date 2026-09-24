import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import jobService from '../../services/jobService';
import JobCard from '../../components/jobs/JobCard';
import SearchBar from '../../components/jobs/SearchBar';
import FilterPanel from '../../components/jobs/FilterPanel';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { FiBriefcase } from 'react-icons/fi';

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isCandidate } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    job_type: searchParams.get('job_type') || '',
    experience_max: searchParams.get('experience_max') || '',
    salary_min: searchParams.get('salary_min') || '',
    posted_within: searchParams.get('posted_within') || '',
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        page_size: 9,
      };
      if (filters.search) queryParams.search = filters.search;
      if (filters.location) queryParams.location = filters.location;
      if (filters.job_type) queryParams.job_type = filters.job_type;
      if (filters.experience_max) queryParams.experience_max = filters.experience_max;
      if (filters.salary_min) queryParams.salary_min = filters.salary_min;
      if (filters.posted_within) queryParams.posted_within = filters.posted_within;

      const data = await jobService.getPublicJobs(queryParams);
      setJobs(data.results || data);
      setTotalCount(data.count ?? (data.results ? data.results.length : data.length));

      // Extract saved job ids if available
      const saved = new Set();
      (data.results || data).forEach((j) => {
        if (j.is_saved) saved.add(j.id);
      });
      setSavedJobIds(saved);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = ({ search, location }) => {
    setFilters((prev) => ({ ...prev, search, location }));
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleFilterReset = () => {
    setFilters({
      search: '',
      location: '',
      job_type: '',
      experience_max: '',
      salary_min: '',
      posted_within: '',
    });
    setPage(1);
  };

  const handleSaveToggle = async (jobId) => {
    if (!isCandidate) return;
    const isCurrentlySaved = savedJobIds.has(jobId);
    try {
      if (isCurrentlySaved) {
        await jobService.unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await jobService.saveJob(jobId);
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error('Error toggling save job:', err);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Explore Opportunities</h1>
          <p>Browse and apply for verified active tech positions from top employers.</p>

          <div style={{ marginTop: '1.5rem', maxWidth: '850px' }}>
            <SearchBar
              onSearch={handleSearch}
              initialSearch={filters.search}
              initialLocation={filters.location}
            />
          </div>
        </div>

        {/* Content Layout */}
        <div className="jobs-layout-grid">
          {/* Left: Filter sidebar */}
          <aside>
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </aside>

          {/* Right: Job listings */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Showing <strong>{jobs.length}</strong> of <strong>{totalCount}</strong> jobs
              </span>
            </div>

            {loading ? (
              <LoadingState message="Loading available positions..." />
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={<FiBriefcase size={44} />}
                title="No jobs match your criteria"
                description="Try broadening your search keywords, clearing location filters, or adjusting salary requirements."
                actionText="Reset All Filters"
                onAction={handleFilterReset}
              />
            ) : (
              <>
                <div className="grid grid-cols-2">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.has(job.id)}
                      onSaveToggle={handleSaveToggle}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalCount > 9 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      Page {page} of {Math.ceil(totalCount / 9)}
                    </span>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={page >= Math.ceil(totalCount / 9)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
