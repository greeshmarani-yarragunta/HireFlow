import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import LoadingState from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiCheck, FiSave } from 'react-icons/fi';

const CandidateProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    location: '',
    bio: '',
    education: '',
    degree: '',
    institution: '',
    graduation_year: '',
    experience: 0,
    skills: '',
    projects: '',
  });
  const [personal, setPersonal] = useState({
    name: '',
    phone: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await authService.getCandidateProfile();
        setProfile({
          location: data.location || '',
          bio: data.bio || '',
          education: data.education || '',
          degree: data.degree || '',
          institution: data.institution || '',
          graduation_year: data.graduation_year || '',
          experience: data.experience || 0,
          skills: data.skills || '',
          projects: data.projects || '',
        });
        if (data.user) {
          setPersonal({
            name: data.user.name || '',
            phone: data.user.phone || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // 1 & 2. Run user info and candidate profile updates in parallel
      const [, updatedProfile] = await Promise.all([
        authService.updateCurrentUser(personal),
        authService.updateCandidateProfile(profile),
      ]);
      updateUser(personal);
      setProfile({
        location: updatedProfile.location || '',
        bio: updatedProfile.bio || '',
        education: updatedProfile.education || '',
        degree: updatedProfile.degree || '',
        institution: updatedProfile.institution || '',
        graduation_year: updatedProfile.graduation_year || '',
        experience: updatedProfile.experience || 0,
        skills: updatedProfile.skills || '',
        projects: updatedProfile.projects || '',
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Failed to update profile. Please verify your fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading candidate profile..." />;

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Candidate Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Update your background and skills to boost algorithmic job match recommendations.
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
          <FiCheck size={18} />
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

      <form onSubmit={handleSubmit}>
        {/* Personal Details */}
        <div className="card mb-6" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Personal Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-control"
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                className="form-control"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
                value={user?.email || ''}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Location (City, State/Country)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Austin, TX"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Professional Bio / Summary</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Brief summary of your expertise and goals..."
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
        </div>

        {/* Education & Experience */}
        <div className="card mb-6" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Education & Work Experience</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Highest Degree</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. B.Tech Computer Science"
                value={profile.degree}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institution / University</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. State University of Technology"
                value={profile.institution}
                onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 2024"
                value={profile.graduation_year}
                onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Professional Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="50"
                className="form-control"
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Skills & Projects */}
        <div className="card mb-6" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Technical Skills & Projects</h3>

          <div className="form-group">
            <label className="form-label">Declared Skills (Comma-separated)</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Python, Django, React, MySQL, Docker, REST API, Git"
              value={profile.skills}
              onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
            />
            <span className="form-text">
              These skills will be matched against required competencies on jobs you browse.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Notable Projects / Portfolio Links</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Describe your prominent projects, open-source repositories, or portfolio URLs..."
              value={profile.projects}
              onChange={(e) => setProfile({ ...profile, projects: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }} disabled={saving}>
            <FiSave size={18} />
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateProfilePage;
