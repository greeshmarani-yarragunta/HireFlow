import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import JobCard from '../../components/jobs/JobCard';
import ApplicationCard from '../../components/applications/ApplicationCard';
import InterviewCard from '../../components/interviews/InterviewCard';
import LoadingState from '../../components/common/LoadingState';
import {
  FiFileText,
  FiAward,
  FiCalendar,
  FiBookmark,
  FiCheckCircle,
  FiArrowRight,
  FiBriefcase,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/candidate/dashboard/');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch candidate dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading your dashboard..." />;

  const stats = data?.stats || {};
  const recentApps = data?.recent_applications || [];
  const upcomingInterviews = data?.upcoming_interviews || [];
  const recommendedJobs = data?.recommended_jobs || [];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Track your active applications, upcoming technical interviews, and AI-matched job openings.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 mb-6">
        <StatCard
          title="Applications"
          value={stats.total_applications}
          icon={<FiFileText />}
          color="var(--primary)"
          bg="var(--primary-light)"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          icon={<FiAward />}
          color="var(--purple)"
          bg="var(--purple-light)"
        />
        <StatCard
          title="Interviews"
          value={stats.interviews}
          icon={<FiCalendar />}
          color="var(--warning-text)"
          bg="var(--warning-light)"
        />
        <StatCard
          title="Saved Jobs"
          value={stats.saved_jobs}
          icon={<FiBookmark />}
          color="var(--success-text)"
          bg="var(--success-light)"
        />
      </div>

      {/* Main Grid: Applications & Interviews */}
      <div className="grid grid-cols-2 mb-6" style={{ alignItems: 'flex-start' }}>
        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Recent Applications</h3>
            <Link to="/candidate/applications" className="btn btn-outline btn-sm">
              View All ({stats.total_applications || 0})
            </Link>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            {recentApps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                You have not applied for any jobs yet.{' '}
                <Link to="/jobs" style={{ fontWeight: 600 }}>Explore jobs</Link>
              </div>
            ) : (
              recentApps.map((app) => <ApplicationCard key={app.id} application={app} />)
            )}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Upcoming Interviews</h3>
            <Link to="/candidate/interviews" className="btn btn-outline btn-sm">
              View All ({stats.interviews || 0})
            </Link>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            {upcomingInterviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No interviews scheduled right now.
              </div>
            ) : (
              upcomingInterviews.map((intv) => <InterviewCard key={intv.id} interview={intv} />)
            )}
          </div>
        </div>
      </div>

      {/* Recommended Jobs for Candidate */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Recommended for Your Skill Set</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Matched against your profile skills: {user?.candidate_profile?.skills || 'Python, Django, React'}
            </span>
          </div>
          <Link to="/jobs" className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
            Browse All Jobs
            <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="card-body">
          {recommendedJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No specific recommendations yet. Explore our open positions in the job board.
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {recommendedJobs.slice(0, 3).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
