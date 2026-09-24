import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import LoadingState from '../../components/common/LoadingState';
import { formatDate } from '../../utils/helpers';
import { FiUsers, FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;
      const data = await adminService.getUsers(params);
      setUsers(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>User Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Inspect candidate, recruiter, and administrator accounts across the platform.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn btn-sm ${roleFilter === '' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRoleFilter('')}>
            All Roles
          </button>
          <button className={`btn btn-sm ${roleFilter === 'CANDIDATE' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRoleFilter('CANDIDATE')}>
            Candidates
          </button>
          <button className={`btn btn-sm ${roleFilter === 'RECRUITER' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRoleFilter('RECRUITER')}>
            Recruiters
          </button>
          <button className={`btn btn-sm ${roleFilter === 'ADMIN' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRoleFilter('ADMIN')}>
            Admins
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="form-control"
            style={{ width: '240px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-outline btn-sm">
            <FiSearch />
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingState message="Loading platform users..." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Registered Date</th>
                <th>Account Access</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-red' : u.role === 'RECRUITER' ? 'badge-purple' : 'badge-blue'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-success'}`}
                      style={{ gap: '0.35rem' }}
                      onClick={() => handleToggleStatus(u.id)}
                    >
                      {u.is_active ? (
                        <>
                          <FiToggleRight size={16} color="var(--danger)" /> Deactivate
                        </>
                      ) : (
                        <>
                          <FiToggleLeft size={16} /> Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
