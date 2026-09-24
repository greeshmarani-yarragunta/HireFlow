import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import jobService from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { FiArrowLeft, FiSave, FiSend } from 'react-icons/fi';
import { JOB_TYPES } from '../../utils/constants';

const RecruiterCreateJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    company: user?.recruiter_profile?.company_name || user?.name || '',
    department: 'Engineering',
    description: '',
    responsibilities: '',
    qualifications: '',
    location: user?.recruiter_profile?.location || 'Remote',
    job_type: 'FULL_TIME',
    experience_min: 2,
    experience_max: 5,
    salary_min: 90000,
    salary_max: 130000,
    required_skills: '',
    openings: 1,
    deadline: '',
    status: 'PENDING_APPROVAL',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (submitStatus) => {
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        status: submitStatus,
      };
      await jobService.createJob(payload);
      navigate('/recruiter/jobs');
    } catch (err) {
      const errObj = err.response?.data || {};
      const firstKey = Object.keys(errObj)[0];
      const msg = firstKey ? `${firstKey}: ${errObj[firstKey]}` : 'Failed to create job posting.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Post a New Job Opportunity</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Positions submitted as 'Pending Approval' will be reviewed by administrators before appearing publicly.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '0.85rem',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger-text)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit('PENDING_APPROVAL'); }}>
        {/* Core Info */}
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
                placeholder="e.g. Senior Python / Django Developer"
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
                placeholder="e.g. TechCorp Innovations"
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
                placeholder="e.g. Cloud Infrastructure, Product"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location (City or 'Remote') *</label>
              <input
                type="text"
                name="location"
                required
                className="form-control"
                placeholder="e.g. San Francisco, CA or Remote"
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

        {/* Experience, Salary, and Required Skills */}
        <div className="card mb-6" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Requirements & Compensation</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Min Experience (Years)</label>
              <input
                type="number"
                name="experience_min"
                min="0"
                className="form-control"
                value={formData.experience_min}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Experience (Years)</label>
              <input
                type="number"
                name="experience_max"
                min="0"
                className="form-control"
                value={formData.experience_max}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Salary ($/yr)</label>
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
              <label className="form-label">Max Salary ($/yr)</label>
              <input
                type="number"
                name="salary_max"
                step="5000"
                className="form-control"
                value={formData.salary_max}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Required Skills (Comma-separated) *</label>
              <input
                type="text"
                name="required_skills"
                required
                className="form-control"
                placeholder="e.g. Python, Django, MySQL, REST API, Git, Docker"
                value={formData.required_skills}
                onChange={handleChange}
              />
              <span className="form-text">
                Crucial: Our Python resume parser matches applicant resumes directly against these skill keywords.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Openings</label>
              <input
                type="number"
                name="openings"
                min="1"
                className="form-control"
                value={formData.openings}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                min={new Date().toISOString().split('T')[0]}
                className="form-control"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Detailed Descriptions */}
        <div className="card mb-6" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Job Description & Expectations</h3>

          <div className="form-group">
            <label className="form-label">Role Overview & Description *</label>
            <textarea
              name="description"
              required
              rows="4"
              className="form-control"
              placeholder="Explain the mission of the team, the project goals, and daily technical context..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Responsibilities</label>
            <textarea
              name="responsibilities"
              rows="4"
              className="form-control"
              placeholder="- Build REST APIs\n- Lead database optimization\n- Collaborate with frontend engineers"
              value={formData.responsibilities}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Qualifications & Background</label>
            <textarea
              name="qualifications"
              rows="4"
              className="form-control"
              placeholder="- Degree in CS or equivalent\n- Experience designing scalable web architectures"
              value={formData.qualifications}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ gap: '0.4rem' }}
            disabled={loading}
            onClick={() => handleSubmit('DRAFT')}
          >
            <FiSave size={16} />
            Save as Draft
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ gap: '0.4rem' }}
            disabled={loading}
          >
            <FiSend size={16} />
            {loading ? 'Submitting...' : 'Submit for Admin Approval'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecruiterCreateJobPage;
