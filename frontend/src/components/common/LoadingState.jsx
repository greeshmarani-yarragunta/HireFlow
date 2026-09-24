import React from 'react';

const LoadingState = ({ message = 'Loading data...', minHeight = '250px' }) => {
  return (
    <div
      style={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '4px' }}></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
