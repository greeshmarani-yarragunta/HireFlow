import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  FiBriefcase,
  FiBell,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiCheckCircle,
} from 'react-icons/fi';
import { formatDateTime } from '../../utils/helpers';

const Navbar = () => {
  const { user, isAuthenticated, isCandidate, isRecruiter, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [notificationsOpen]);

  const handleLogout = () => {
    logout();
    navigate('/candidate/login');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isRecruiter) return '/recruiter/dashboard';
    if (isCandidate) return '/candidate/dashboard';
    return '/jobs';
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-badge">
            <FiBriefcase size={20} />
          </div>
          <span>HireFlow</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar-nav">
          <li>
            <Link to="/jobs" className="nav-link">
              Find Jobs
            </Link>
          </li>
          <li>
            <Link to="/how-it-works" className="nav-link">
              How It Works
            </Link>
          </li>

          {isAuthenticated && (
            <li>
              <Link to={getDashboardPath()} className="nav-link" style={{ fontWeight: 600 }}>
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div ref={notificationRef} style={{ position: 'relative' }}>
                <button
                  className="btn-outline"
                  style={{
                    position: 'relative',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileMenuOpen(false);
                  }}
                  aria-label="Notifications"
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        backgroundColor: 'var(--danger)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '340px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--border)',
                      zIndex: 60,
                      maxHeight: '420px',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, maxHeight: '320px' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((notif) => (
                          <div
                            key={notif.id}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--border)',
                              backgroundColor: notif.is_read ? 'transparent' : 'var(--primary-light)',
                              cursor: 'pointer',
                              transition: 'background var(--transition-fast)',
                            }}
                            onClick={() => markAsRead(notif.id)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{notif.title}</strong>
                              {!notif.is_read && (
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '4px' }} />
                              )}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                              {notif.message}
                            </p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.3rem', display: 'block' }}>
                              {formatDateTime(notif.created_at)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.6rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => {
                    setProfileMenuOpen(!profileMenuOpen);
                    setNotificationsOpen(false);
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown size={14} />
                </button>

                {profileMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '220px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--border)',
                      zIndex: 60,
                      padding: '0.5rem',
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.4rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                      <span className={`badge ${isAdmin ? 'badge-red' : isRecruiter ? 'badge-purple' : 'badge-blue'}`} style={{ marginTop: '0.4rem' }}>
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to={
                        isCandidate
                          ? '/candidate/profile'
                          : isRecruiter
                          ? '/recruiter/company'
                          : '/admin/dashboard'
                      }
                      className="nav-link"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <FiUser size={15} />
                      Profile & Details
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="nav-link"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        width: '100%',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: 'var(--danger)',
                        textAlign: 'left',
                      }}
                    >
                      <FiLogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/candidate/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/candidate/signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            className="mobile-menu-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              fontSize: '1.4rem',
              display: 'none',
              padding: '0.2rem',
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--bg-surface)',
            zIndex: 40,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link
            to="/jobs"
            className="nav-link"
            style={{ fontSize: '1.1rem', padding: '0.75rem 0' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Find Jobs
          </Link>
          <Link
            to="/how-it-works"
            className="nav-link"
            style={{ fontSize: '1.1rem', padding: '0.75rem 0' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                className="nav-link"
                style={{ fontSize: '1.1rem', padding: '0.75rem 0' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Dashboard
              </Link>
              <button
                className="btn btn-danger btn-block"
                style={{ marginTop: 'auto' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/candidate/login"
                className="btn btn-outline btn-block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Candidate Sign In
              </Link>
              <Link
                to="/recruiter/login"
                className="btn btn-outline btn-block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recruiter Portal
              </Link>
              <Link
                to="/candidate/signup"
                className="btn btn-primary btn-block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Candidate Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
