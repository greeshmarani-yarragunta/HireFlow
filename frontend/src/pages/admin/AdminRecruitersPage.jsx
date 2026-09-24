import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import LoadingState from '../../components/common/LoadingState';
import { formatDate } from '../../utils/helpers';
import { FiGlobe, FiSearch } from 'react-icons/fi';

const AdminRecruitersPage = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ role: 'RECRUITER', search });
      setRecruiters(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Employer Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Registered hiring organizations and recruiters.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchRecruiters(); }} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search recruiters..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-outline btn-sm">Search</button>
        </form>
      </div>

      {loading ? (
        <LoadingState message="Fetching employer accounts..." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Recruiter</th>
                <th>Contact</th>
                <th>Account Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recruiters.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.email}</div>
                  </td>
                  <td>{r.phone || 'N/A'}</td>
                  <td>
                    <span className={`badge ${r.is_active ? 'badge-green' : 'badge-red'}`}>
                      {r.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRecruitersPage;
