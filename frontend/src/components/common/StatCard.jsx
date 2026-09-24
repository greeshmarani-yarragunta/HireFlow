import React from 'react';

const StatCard = ({ title, value, icon, color = 'var(--primary)', bg = 'var(--primary-light)', trend }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: bg, color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value ?? 0}</div>
        <div className="stat-label">{title}</div>
        {trend && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
