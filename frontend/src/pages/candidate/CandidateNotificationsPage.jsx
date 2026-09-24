import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/helpers';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';

const CandidateNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { markAsRead, markAllAsRead, fetchUnreadCount } = useNotifications();

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({
        unread: unreadOnly ? 'true' : undefined,
      });
      setNotifications(data.results || data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [unreadOnly]);

  const handleMarkOne = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Notifications</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Real-time updates regarding application reviews, shortlisting, and interviews.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${unreadOnly ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            {unreadOnly ? 'Showing Unread' : 'Show Unread Only'}
          </button>

          <button className="btn btn-outline btn-sm" onClick={handleMarkAll}>
            Mark All as Read
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<FiBell size={44} />}
          title="No notifications"
          description={unreadOnly ? 'You have no unread notifications.' : 'You have no alerts at this time.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: item.is_read ? 'var(--bg-surface)' : 'var(--primary-light)',
                borderLeft: item.is_read ? '1px solid var(--border)' : '4px solid var(--primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span className="badge badge-blue">{item.notification_type}</span>
                  <h4 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main)' }}>{item.title}</h4>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.2rem 0', lineHeight: 1.5 }}>
                  {item.message}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  {formatDateTime(item.created_at)}
                </span>
              </div>

              {!item.is_read && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.3rem' }}
                  onClick={() => handleMarkOne(item.id)}
                >
                  <FiCheck size={14} />
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateNotificationsPage;
