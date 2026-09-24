import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import LoadingState from '../../components/common/LoadingState';
import { formatDate } from '../../utils/helpers';
import { FiUser, FiSearch } from 'react-icons/fi';

const AdminCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ role: 'CANDIDATE', search });
      setCandidates(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Candidate Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Registered talent profiles across HireFlow.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchCandidates(); }} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search candidates..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-outline btn-sm">Search</button>
        </form>
      </div>

      {loading ? (
        <LoadingState message="Fetching candidate talent directory..." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td>{c.phone || 'No phone provided'}</td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-green' : 'badge-red'}`}>
                      {c.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCandidatesPage;
