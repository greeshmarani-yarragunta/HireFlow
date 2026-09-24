import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiHeart, FiShield, FiCode } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--secondary)',
        color: '#94a3b8',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="container" style={{ padding: '3.5rem 1.5rem 2rem' }}>
        <div className="grid grid-cols-4 mb-6">
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', marginBottom: '1rem', fontWeight: 800, fontSize: '1.25rem' }}>
              <div className="brand-badge">
                <FiBriefcase size={18} />
              </div>
              <span>HireFlow</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
              Modern, responsive, end-to-end recruitment management platform connecting candidates, recruiters, and administrators.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">Django 5</span>
              <span className="badge badge-green">MySQL 8.4</span>
              <span className="badge badge-purple">React 19</span>
            </div>
          </div>

          {/* Candidates */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem' }}>For Candidates</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><Link to="/jobs" style={{ color: '#94a3b8' }}>Browse Jobs</Link></li>
              <li><Link to="/candidate/signup" style={{ color: '#94a3b8' }}>Candidate Registration</Link></li>
              <li><Link to="/candidate/login" style={{ color: '#94a3b8' }}>Candidate Portal</Link></li>
              <li><Link to="/candidate/resume" style={{ color: '#94a3b8' }}>Resume Match Analysis</Link></li>
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem' }}>For Employers</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><Link to="/recruiter/signup" style={{ color: '#94a3b8' }}>Post a Job</Link></li>
              <li><Link to="/recruiter/login" style={{ color: '#94a3b8' }}>Recruiter Portal</Link></li>
              <li><Link to="/how-it-works" style={{ color: '#94a3b8' }}>Hiring Workflow</Link></li>
              <li><Link to="/recruiter/interviews" style={{ color: '#94a3b8' }}>Interview Scheduling</Link></li>
            </ul>
          </div>

          {/* Platform & Admin */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem' }}>Administration</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><Link to="/admin/login" style={{ color: '#94a3b8' }}>Admin Login</Link></li>
              <li><Link to="/admin/dashboard" style={{ color: '#94a3b8' }}>Job Approval Queue</Link></li>
              <li><Link to="/how-it-works" style={{ color: '#94a3b8' }}>System Architecture</Link></li>
              <li><span style={{ color: '#64748b' }}>REST API v1.0</span></li>
            </ul>
          </div>
        </div>

        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <div>
            © {new Date().getFullYear()} HireFlow Inc. All rights reserved. Full-stack Python Recruitment Platform.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Built with Python Django, MySQL, React & REST APIs
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
