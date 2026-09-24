import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/helpers';
import { FiBell, FiCheck } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';

const RecruiterNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { markAsRead, markAllAsRead } = useNotifications();

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Employer Notifications</h1>
          <p style={{ color: 'var(--text-muted)' }}>Alerts on new applications and candidate pipeline updates.</p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={async () => {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
          }}
        >
          Mark All as Read
        </button>
      </div>

      {loading ? (
        <LoadingState message="Fetching notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState icon={<FiBell size={44} />} title="No notifications" description="No alerts at this time." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: item.is_read ? 'var(--bg-surface)' : 'var(--purple-light)',
                borderLeft: item.is_read ? '1px solid var(--border)' : '4px solid var(--purple)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span className="badge badge-purple">{item.notification_type}</span>
                  <h4 style={{ fontSize: '1rem', margin: 0 }}>{item.title}</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>{item.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{formatDateTime(item.created_at)}</span>
              </div>
              {!item.is_read && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={async () => {
                    await markAsRead(item.id);
                    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
                  }}
                >
                  <FiCheck size={14} /> Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterNotificationsPage;
