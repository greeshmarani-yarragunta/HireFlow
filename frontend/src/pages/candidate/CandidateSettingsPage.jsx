import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { FiSettings, FiCheck } from 'react-icons/fi';

const CandidateSettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [success, setSuccess] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await authService.updateCurrentUser({ name, phone });
      updateUser({ name, phone });
      setSuccess('Account settings saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '650px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your credentials and preferences.
        </p>
      </div>

      {success && (
        <div style={{ padding: '0.8rem', backgroundColor: 'var(--success-light)', color: 'var(--success-text)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <FiCheck /> {success}
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email (Immutable)</label>
            <input
              type="email"
              disabled
              className="form-control"
              style={{ backgroundColor: 'var(--bg-subtle)' }}
              value={user?.email || ''}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Platform Role</label>
            <span className="badge badge-blue">{user?.role}</span>
          </div>

          <button type="submit" className="btn btn-primary mt-4">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default CandidateSettingsPage;
