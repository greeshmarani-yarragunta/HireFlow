import React, { useState } from 'react';
import { FiSearch, FiMapPin } from 'react-icons/fi';

const SearchBar = ({ onSearch, initialSearch = '', initialLocation = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search: searchTerm, location });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '0.6rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.6rem',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* Title / Skill search */}
      <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.8rem' }}>
        <FiSearch size={18} color="var(--primary)" />
        <input
          type="text"
          placeholder="Job title, skills (e.g. Python, React), or company"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '0.925rem',
            backgroundColor: 'transparent',
            color: 'var(--text-main)',
          }}
        />
      </div>

      <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border)', display: 'none' }} className="search-divider" />

      {/* Location search */}
      <div style={{ flex: '1 1 180px', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.8rem' }}>
        <FiMapPin size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="City, state, or 'Remote'"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '0.925rem',
            backgroundColor: 'transparent',
            color: 'var(--text-main)',
          }}
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.6rem' }}>
        Search Jobs
      </button>
    </form>
  );
};

export default SearchBar;
