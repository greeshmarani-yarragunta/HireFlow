import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import LoadingState from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { FiGlobe, FiCheck, FiSave } from 'react-icons/fi';

const RecruiterCompanyProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    company_name: '',
    company_description: '',
    website: '',
    location: '',
    industry: '',
    company_size: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await authService.getRecruiterProfile();
        setProfile({
          company_name: data.company_name || '',
          company_description: data.company_description || '',
          website: data.website || '',
          location: data.location || '',
          industry: data.industry || '',
          company_size: data.company_size || '',
        });
      } catch (err) {
        console.error('Failed to load company profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const updated = await authService.updateRecruiterProfile(profile);
      setProfile(updated);
      setSuccess('Company profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to update company profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading employer profile..." />;

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Company Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your organization branding, website, and industry details displayed on job postings.
        </p>
      </div>

      {success && (
        <div style={{ padding: '0.85rem', backgroundColor: 'var(--success-light)', color: 'var(--success-text)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <FiCheck /> {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.85rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card mb-6" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Organization Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Website URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://acme.com"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Headquarters / Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. San Francisco, CA"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Industry</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Cloud Infrastructure, FinTech"
                value={profile.industry}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Size</label>
              <select
                className="form-select"
                value={profile.company_size}
                onChange={(e) => setProfile({ ...profile, company_size: e.target.value })}
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Company Overview</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Describe your company culture, technology stack, and mission..."
                value={profile.company_description}
                onChange={(e) => setProfile({ ...profile, company_description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" style={{ gap: '0.4rem' }} disabled={saving}>
              <FiSave size={16} />
              {saving ? 'Saving...' : 'Save Company Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RecruiterCompanyProfilePage;
