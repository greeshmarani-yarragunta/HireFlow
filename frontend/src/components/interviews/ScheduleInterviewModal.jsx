import React, { useState } from 'react';
import Modal from '../common/Modal';
import { INTERVIEW_TYPES } from '../../utils/constants';

const ScheduleInterviewModal = ({ isOpen, onClose, application, onScheduled }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '14:00',
    interview_type: 'TECHNICAL',
    meeting_link: 'https://meet.google.com/hireflow-interview',
    interviewer: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) {
      setError('Please select an interview date.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await onScheduled({
        application_id: application.id,
        ...formData,
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.application_id ||
        err.response?.data?.date ||
        err.response?.data?.detail ||
        'Failed to schedule interview. Please check the date and details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Interview: ${application?.candidate?.name}`}
      maxWidth="550px"
      footer={
        <>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="schedule-form" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? 'Scheduling...' : 'Confirm & Schedule Interview'}
          </button>
        </>
      }
    >
      <form id="schedule-form" onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger-text)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Interview Date *</label>
            <input
              type="date"
              name="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="form-control"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Time *</label>
            <input
              type="time"
              name="time"
              required
              className="form-control"
              value={formData.time}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Round / Type *</label>
          <select
            name="interview_type"
            className="form-select"
            value={formData.interview_type}
            onChange={handleChange}
          >
            {Object.entries(INTERVIEW_TYPES).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Interviewer Name</label>
          <input
            type="text"
            name="interviewer"
            placeholder="e.g. Sarah Jenkins (Tech Lead)"
            className="form-control"
            value={formData.interviewer}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Meeting URL</label>
          <input
            type="url"
            name="meeting_link"
            placeholder="https://meet.google.com/xyz or Zoom link"
            className="form-control"
            value={formData.meeting_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Preparation Notes for Candidate</label>
          <textarea
            name="notes"
            rows="3"
            placeholder="Topics to prepare, portfolio presentation guidelines, etc."
            className="form-control"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleInterviewModal;
