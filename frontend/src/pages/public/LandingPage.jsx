import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/jobService';
import JobCard from '../../components/jobs/JobCard';
import SearchBar from '../../components/jobs/SearchBar';
import LoadingState from '../../components/common/LoadingState';
import {
  FiBriefcase,
  FiAward,
  FiCalendar,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiZap,
} from 'react-icons/fi';

const LandingPage = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobService.getPublicJobs({ page_size: 6 });
        setFeaturedJobs(data.results || data);
      } catch (err) {
        console.error('Failed to load featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSearch = ({ search, location }) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleQuickDemoLogin = async (email, password, redirectPath) => {
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, #1e3a8a 0%, #0f172a 100%)',
          color: 'white',
          padding: '5.5rem 1.5rem 5rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="container" style={{ maxWidth: '900px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#93c5fd',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <FiZap />
            <span>Next-Generation Intelligent Recruitment Management</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
            }}
          >
            Where Top Tech Talent Meets Visionary Companies.
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: '#cbd5e1',
              maxWidth: '720px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}
          >
            Streamline your entire hiring pipeline from job posting and algorithmic resume skill matching to interview scheduling and final offer.
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: '800px', margin: '0 auto 2.5rem' }}>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Platform Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1.5rem',
              marginTop: '3.5rem',
              paddingTop: '2.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa' }}>500+</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Active Openings</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>1,200+</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Verified Candidates</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc' }}>94%</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Skill Match Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Automated Workflow</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Demo Access Bar */}
      <section style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-blue">Quick Demo Access</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Explore HireFlow with pre-configured accounts:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleQuickDemoLogin('candidate@hireflow.com', 'Candidate@123', '/candidate/dashboard')}
            >
              👤 Candidate Demo
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleQuickDemoLogin('recruiter@techcorp.com', 'Recruiter@123', '/recruiter/dashboard')}
            >
              🏢 Recruiter Demo
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemoLogin('admin@hireflow.com', 'Admin@123', '/admin/dashboard')}
            >
              ⚡ Admin Demo
            </button>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Built for the Modern Hiring Cycle</h2>
            <p>Every step of the recruitment journey connects through relational database state enforcement.</p>
          </div>

          <div className="grid grid-cols-3">
            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <FiAward />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Resume Match Analysis</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                Modular keyword and skill parsing extracts tech competencies from PDF and DOCX files to benchmark candidate readiness.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--purple-light)',
                  color: 'var(--purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <FiCalendar />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Interview Lifecycle</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                Recruiters schedule technical, HR, or managerial rounds. Candidates receive automated alerts and meeting links instantly.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <FiShield />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Admin Governance</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                Every job posting requires administrative approval before going live to guarantee quality and spam prevention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section style={{ padding: '4.5rem 1.5rem', backgroundColor: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Featured Opportunities</h2>
              <p>Explore recently approved roles from leading tech teams.</p>
            </div>
            <Link to="/jobs" className="btn btn-outline" style={{ gap: '0.5rem' }}>
              View All Openings
              <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Fetching active job listings..." />
          ) : featuredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No active jobs found right now.
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--bg-surface)' }}>
        <div
          className="container"
          style={{
            backgroundColor: 'var(--secondary)',
            color: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'white', marginBottom: '1rem' }}>
            Ready to Supercharge Your Hiring Workflow?
          </h2>
          <p style={{ color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
            Join HireFlow today as a candidate or recruiter to experience modern recruitment automation.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/candidate/signup" className="btn btn-primary btn-lg">
              Apply as Candidate
            </Link>
            <Link to="/recruiter/signup" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Hire Top Talent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
