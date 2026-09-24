import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute, PublicLayout } from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import JobsPage from './pages/public/JobsPage';
import JobDetailsPage from './pages/public/JobDetailsPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import CandidateLoginPage from './pages/public/CandidateLoginPage';
import CandidateSignupPage from './pages/public/CandidateSignupPage';
import RecruiterLoginPage from './pages/public/RecruiterLoginPage';
import RecruiterSignupPage from './pages/public/RecruiterSignupPage';
import AdminLoginPage from './pages/public/AdminLoginPage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateApplicationsPage from './pages/candidate/CandidateApplicationsPage';
import CandidateApplicationDetailPage from './pages/candidate/CandidateApplicationDetailPage';
import CandidateSavedJobsPage from './pages/candidate/CandidateSavedJobsPage';
import CandidateInterviewsPage from './pages/candidate/CandidateInterviewsPage';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import CandidateResumePage from './pages/candidate/CandidateResumePage';
import CandidateNotificationsPage from './pages/candidate/CandidateNotificationsPage';
import CandidateSettingsPage from './pages/candidate/CandidateSettingsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterJobsPage from './pages/recruiter/RecruiterJobsPage';
import RecruiterCreateJobPage from './pages/recruiter/RecruiterCreateJobPage';
import RecruiterEditJobPage from './pages/recruiter/RecruiterEditJobPage';
import RecruiterApplicantsPage from './pages/recruiter/RecruiterApplicantsPage';
import RecruiterApplicantDetailPage from './pages/recruiter/RecruiterApplicantDetailPage';
import RecruiterInterviewsPage from './pages/recruiter/RecruiterInterviewsPage';
import RecruiterCompanyProfilePage from './pages/recruiter/RecruiterCompanyProfilePage';
import RecruiterNotificationsPage from './pages/recruiter/RecruiterNotificationsPage';
import RecruiterSettingsPage from './pages/recruiter/RecruiterSettingsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCandidatesPage from './pages/admin/AdminCandidatesPage';
import AdminRecruitersPage from './pages/admin/AdminRecruitersPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/candidate/login" element={<CandidateLoginPage />} />
              <Route path="/candidate/signup" element={<CandidateSignupPage />} />
              <Route path="/recruiter/login" element={<RecruiterLoginPage />} />
              <Route path="/recruiter/signup" element={<RecruiterSignupPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>

            {/* Candidate Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="/candidate/jobs" element={<Navigate to="/jobs" replace />} />
              <Route path="/candidate/applications" element={<CandidateApplicationsPage />} />
              <Route path="/candidate/applications/:id" element={<CandidateApplicationDetailPage />} />
              <Route path="/candidate/saved-jobs" element={<CandidateSavedJobsPage />} />
              <Route path="/candidate/interviews" element={<CandidateInterviewsPage />} />
              <Route path="/candidate/profile" element={<CandidateProfilePage />} />
              <Route path="/candidate/resume" element={<CandidateResumePage />} />
              <Route path="/candidate/notifications" element={<CandidateNotificationsPage />} />
              <Route path="/candidate/settings" element={<CandidateSettingsPage />} />
            </Route>

            {/* Recruiter Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
              <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
              <Route path="/recruiter/jobs" element={<RecruiterJobsPage />} />
              <Route path="/recruiter/jobs/create" element={<RecruiterCreateJobPage />} />
              <Route path="/recruiter/jobs/:id" element={<RecruiterEditJobPage />} />
              <Route path="/recruiter/applicants" element={<RecruiterApplicantsPage />} />
              <Route path="/recruiter/applicants/:id" element={<RecruiterApplicantDetailPage />} />
              <Route path="/recruiter/interviews" element={<RecruiterInterviewsPage />} />
              <Route path="/recruiter/company" element={<RecruiterCompanyProfilePage />} />
              <Route path="/recruiter/notifications" element={<RecruiterNotificationsPage />} />
              <Route path="/recruiter/settings" element={<RecruiterSettingsPage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/candidates" element={<AdminCandidatesPage />} />
              <Route path="/admin/recruiters" element={<AdminRecruitersPage />} />
              <Route path="/admin/jobs" element={<AdminJobsPage />} />
              <Route path="/admin/applications" element={<AdminApplicationsPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
