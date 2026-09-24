import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import jobService from '../../services/jobService';
import LoadingState from '../../components/common/LoadingState';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { JOB_TYPES } from '../../utils/constants';

const RecruiterEditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const data = await jobService.getRecruiterJobDetails(id);
        setFormData({
          title: data.title,
          company: data.company,
          department: data.department || '',
          description: data.description,
          responsibilities: data.responsibilities || '',
          qualifications: data.qualifications || '',
          location: data.location,
          job_type: data.job_type,
          experience_min: data.experience_min,
          experience_max: data.experience_max,
          salary_min: data.salary_min || '',
          salary_max: data.salary_max || '',
          required_skills: data.required_skills,
          openings: data.openings,
          deadline: data.deadline || '',
          status: data.status,
        });
      } catch (err) {
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await jobService.updateJob(id, formData);
      navigate('/recruiter/jobs');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update job posting.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading job for editing..." />;
  if (error || !formData) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: '900px' }}>
      <Link
        to="/recruiter/jobs"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}
      >
        <FiArrowLeft />
        Back to Job Postings
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Edit Job Posting</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Update role parameters, description, and required skill criteria.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-6" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Basic Job Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                name="title"
                required
                className="form-control"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hiring Company *</label>
              <input
                type="text"
                name="company"
                required
                className="form-control"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                name="location"
                required
                className="form-control"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Employment Type *</label>
              <select
                name="job_type"
                className="form-select"
                value={formData.job_type}
                onChange={handleChange}
              >
                {Object.entries(JOB_TYPES).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card mb-6" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Requirements & Skills</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Required Skills (Comma-separated) *</label>
              <input
                type="text"
                name="required_skills"
                required
                className="form-control"
                value={formData.required_skills}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Salary ($)</label>
              <input
                type="number"
                name="salary_min"
                step="5000"
                className="form-control"
                value={formData.salary_min}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Salary ($)</label>
              <input
                type="number"
                name="salary_max"
                step="5000"
                className="form-control"
                value={formData.salary_max}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Role Overview & Description *</label>
            <textarea
              name="description"
              required
              rows="4"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/recruiter/jobs" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Updating...' : 'Save Job Updates'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecruiterEditJobPage;
