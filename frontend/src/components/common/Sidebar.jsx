import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiBriefcase,
  FiFileText,
  FiCalendar,
  FiUser,
  FiSettings,
  FiBookmark,
  FiPlusCircle,
  FiUsers,
  FiGlobe,
  FiBarChart2,
  FiCheckSquare,
  FiBell,
  FiAward,
} from 'react-icons/fi';

const Sidebar = () => {
  const { role, isCandidate, isRecruiter, isAdmin } = useAuth();

  const candidateLinks = [
    { to: '/candidate/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/jobs', icon: <FiBriefcase />, label: 'Browse Jobs' },
    { to: '/candidate/applications', icon: <FiFileText />, label: 'My Applications' },
    { to: '/candidate/saved-jobs', icon: <FiBookmark />, label: 'Saved Jobs' },
    { to: '/candidate/interviews', icon: <FiCalendar />, label: 'Interviews' },
    { to: '/candidate/profile', icon: <FiUser />, label: 'Profile' },
    { to: '/candidate/resume', icon: <FiAward />, label: 'Resume & Skills' },
    { to: '/candidate/notifications', icon: <FiBell />, label: 'Notifications' },
    { to: '/candidate/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/recruiter/jobs', icon: <FiBriefcase />, label: 'Job Postings' },
    { to: '/recruiter/jobs/create', icon: <FiPlusCircle />, label: 'Post New Job' },
    { to: '/recruiter/applicants', icon: <FiUsers />, label: 'Applicants' },
    { to: '/recruiter/interviews', icon: <FiCalendar />, label: 'Interviews' },
    { to: '/recruiter/company', icon: <FiGlobe />, label: 'Company Profile' },
    { to: '/recruiter/notifications', icon: <FiBell />, label: 'Notifications' },
    { to: '/recruiter/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { to: '/admin/candidates', icon: <FiUser />, label: 'Candidates' },
    { to: '/admin/recruiters', icon: <FiGlobe />, label: 'Recruiters' },
    { to: '/admin/jobs', icon: <FiCheckSquare />, label: 'Review Jobs' },
    { to: '/admin/applications', icon: <FiFileText />, label: 'Applications' },
    { to: '/admin/reports', icon: <FiBarChart2 />, label: 'Reports' },
    { to: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  let links = [];
  let roleTitle = 'Portal';

  if (isCandidate) {
    links = candidateLinks;
    roleTitle = 'Candidate Portal';
  } else if (isRecruiter) {
    links = recruiterLinks;
    roleTitle = 'Recruiter Portal';
  } else if (isAdmin) {
    links = adminLinks;
    roleTitle = 'Admin Portal';
  }

  return (
    <aside className="sidebar">
      <div style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)' }}>
          {roleTitle}
        </div>
      </div>
      <ul className="sidebar-menu">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to.endsWith('/dashboard')}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
