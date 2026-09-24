import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiBriefcase,
  FiShield,
  FiAward,
  FiCalendar,
  FiUserCheck,
  FiArrowRight,
} from 'react-icons/fi';

const HowItWorksPage = () => {
  const steps = [
    {
      step: '01',
      title: 'Job Creation & Department Scoping',
      role: 'Recruiter',
      roleColor: 'var(--purple)',
      icon: <FiBriefcase size={28} />,
      desc: 'Recruiters define clear job parameters: title, department, responsibilities, salary ranges, experience brackets, and required technical skills.',
    },
    {
      step: '02',
      title: 'Administrative Review & Approval',
      role: 'Administrator',
      roleColor: 'var(--danger)',
      icon: <FiShield size={28} />,
      desc: 'To prevent spam and ensure platform integrity, new job submissions enter a PENDING_APPROVAL queue. Platform admins review, approve, or request modifications.',
    },
    {
      step: '03',
      title: 'Candidate Discovery & Job Matching',
      role: 'Candidate',
      roleColor: 'var(--primary)',
      icon: <FiAward size={28} />,
      desc: 'Active jobs are instantly indexed for backend parameterized search and multi-facet filtering (skills, location, salary, experience, date).',
    },
    {
      step: '04',
      title: 'Resume Extraction & Skill Match Engine',
      role: 'Python Service',
      roleColor: 'var(--info)',
      icon: <FiCheckCircle size={28} />,
      desc: 'Upon application, our Python parsing engine extracts candidate competencies from PDF/DOCX files and calculates an algorithmic match percentage against required skills.',
    },
    {
      step: '05',
      title: 'Candidate Shortlisting & Pipeline Review',
      role: 'Recruiter',
      roleColor: 'var(--purple)',
      icon: <FiUserCheck size={28} />,
      desc: 'Recruiters inspect candidate dossiers, full resume text, and matched/missing skill breakdowns, advancing qualified candidates to SHORTLISTED status.',
    },
    {
      step: '06',
      title: 'Interview Scheduling & Live Coordination',
      role: 'Recruiter & Candidate',
      roleColor: 'var(--success-text)',
      icon: <FiCalendar size={28} />,
      desc: 'Recruiters schedule Technical, HR, or Managerial interview rounds with automated candidate notifications and meeting links.',
    },
    {
      step: '07',
      title: 'Interview Completion & Final Selection',
      role: 'All Parties',
      roleColor: 'var(--primary)',
      icon: <FiCheckCircle size={28} />,
      desc: 'Completed interviews unlock final hiring decisions (SELECTED or REJECTED), triggering automated alerts and updating candidate status.',
    },
  ];

  return (
    <div style={{ padding: '3.5rem 0 6rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="badge badge-blue" style={{ marginBottom: '1rem' }}>
            Lifecycle & Architecture
          </span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            How HireFlow Works End-to-End
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto' }}>
            A rigorous, reliable recruitment workflow built on Django ORM state machines, MySQL persistence, and responsive React client interfaces.
          </p>
        </div>

        {/* Timeline Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {steps.map((item, index) => (
            <div
              key={index}
              className="card"
              style={{
                padding: '2rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'flex-start',
                borderLeft: `5px solid ${item.roleColor}`,
              }}
            >
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--text-light)',
                  fontFamily: 'var(--font-heading)',
                  lineHeight: 1,
                  minWidth: '45px',
                }}
              >
                {item.step}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: item.roleColor,
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {item.role}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
                    {item.title}
                  </h3>
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '0.5rem' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            marginTop: '4rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            padding: '3rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
          }}
        >
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Experience the Entire Workflow Now</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Jump into candidate, recruiter, or admin demo accounts to test each step in real time.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/candidate/login" className="btn btn-primary">
              Candidate Login
            </Link>
            <Link to="/recruiter/login" className="btn btn-outline">
              Recruiter Portal
            </Link>
            <Link to="/admin/login" className="btn btn-secondary">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
