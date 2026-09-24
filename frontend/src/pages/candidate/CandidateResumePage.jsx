import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import FileUpload from '../../components/profile/FileUpload';
import LoadingState from '../../components/common/LoadingState';
import { FiDownload, FiCheckCircle, FiFileText, FiUploadCloud } from 'react-icons/fi';

const CandidateResumePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getCandidateProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      const updated = await authService.updateCandidateProfile(formData);
      setProfile(updated);
      setSelectedFile(null);
      setSuccessMsg('Resume uploaded successfully and linked to your profile!');
    } catch (err) {
      setErrorMsg(err.response?.data?.resume?.[0] || 'Failed to upload resume. Please check file format and size.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingState message="Loading your resume status..." />;

  const skillsList = profile?.skills ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Resume & Skill Analysis</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your primary resume document used for algorithmic skill matching across jobs.
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success-text)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <FiCheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger-text)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Current Resume Card */}
      <div className="card mb-6" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiFileText color="var(--primary)" />
          Active Stored Resume
        </h3>

        {profile?.resume ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                {profile.resume_name || 'candidate_resume.pdf'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Saved and active for 1-click job applications
              </div>
            </div>

            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <FiDownload size={14} />
              View / Download Document
            </a>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No resume uploaded yet. Upload your PDF or DOCX resume below to enable rapid applications.
          </div>
        )}
      </div>

      {/* Upload / Replace Resume Form */}
      <div className="card mb-6" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          {profile?.resume ? 'Replace Current Resume' : 'Upload New Resume'}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Uploading an updated resume refreshes your match scores on future job applications.
        </p>

        <FileUpload
          onFileSelect={(file) => setSelectedFile(file)}
          label="Choose Resume File (PDF or DOCX, Max 5MB)"
        />

        {selectedFile && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading}
              style={{ gap: '0.4rem' }}
            >
              <FiUploadCloud size={16} />
              {uploading ? 'Processing File...' : 'Upload & Save Resume'}
            </button>
          </div>
        )}
      </div>

      {/* Extracted Skills Preview */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Skills Identified on Your Profile</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          These skills are used by our matching engine to score your job applications.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {skillsList.length > 0 ? (
            skillsList.map((skill, idx) => (
              <span key={idx} className="skill-chip skill-chip-matched">
                ✓ {skill}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No declared skills found. Update your profile skills list to enhance matching.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateResumePage;
