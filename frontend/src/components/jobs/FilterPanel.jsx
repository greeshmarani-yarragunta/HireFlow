import React from 'react';
import { FiFilter, FiRotateCcw } from 'react-icons/fi';
import { JOB_TYPES } from '../../utils/constants';

const FilterPanel = ({ filters, onChange, onReset }) => {
  const handleTypeChange = (typeKey) => {
    onChange({
      ...filters,
      job_type: filters.job_type === typeKey ? '' : typeKey,
    });
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        position: 'sticky',
        top: '90px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
          <FiFilter size={16} color="var(--primary)" />
          Filters
        </h4>
        <button
          onClick={onReset}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontWeight: 600,
          }}
        >
          <FiRotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Job Type */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ marginBottom: '0.6rem' }}>Employment Type</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Object.entries(JOB_TYPES).map(([key, label]) => (
            <label
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={filters.job_type === key}
                onChange={() => handleTypeChange(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Max Experience */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">
          Max Experience: {filters.experience_max ? `${filters.experience_max} years` : 'Any'}
        </label>
        <input
          type="range"
          min="0"
          max="15"
          step="1"
          value={filters.experience_max || 15}
          onChange={(e) =>
            onChange({ ...filters, experience_max: e.target.value === '15' ? '' : e.target.value })
          }
          style={{ width: '100%', accentColor: 'var(--primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Entry (0)</span>
          <span>Mid (5)</span>
          <span>Senior (15+)</span>
        </div>
      </div>

      {/* Min Salary */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">Minimum Salary ($)</label>
        <input
          type="number"
          step="5000"
          placeholder="e.g. 80000"
          className="form-control"
          value={filters.salary_min || ''}
          onChange={(e) => onChange({ ...filters, salary_min: e.target.value })}
        />
      </div>

      {/* Date Posted */}
      <div>
        <label className="form-label">Posted Date</label>
        <select
          className="form-select"
          value={filters.posted_within || ''}
          onChange={(e) => onChange({ ...filters, posted_within: e.target.value })}
        >
          <option value="">Any time</option>
          <option value="1">Past 24 hours</option>
          <option value="7">Past week</option>
          <option value="30">Past month</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
