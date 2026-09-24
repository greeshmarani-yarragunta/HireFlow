import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({
  icon = <FiInbox size={48} />,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1rem 0',
      }}
    >
      <div style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
        {title}
      </h3>
      <p style={{ maxWidth: '420px', fontSize: '0.9rem', marginBottom: actionText ? '1.5rem' : '0' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
