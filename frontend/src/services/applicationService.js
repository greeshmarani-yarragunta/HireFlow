import api from './api';

export const applicationService = {
  async getCandidateApplications(params = {}) {
    const response = await api.get('/candidate/applications/', { params });
    return response.data;
  },

  async getCandidateApplicationDetails(id) {
    const response = await api.get(`/candidate/applications/${id}/`);
    return response.data;
  },

  async applyForJob(formData) {
    const response = await api.post('/candidate/applications/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getRecruiterApplicants(params = {}) {
    const response = await api.get('/recruiter/applicants/', { params });
    return response.data;
  },

  async getRecruiterApplicantDetails(id) {
    const response = await api.get(`/recruiter/applicants/${id}/`);
    return response.data;
  },

  async updateApplicantStatus(id, status, notes = '') {
    const response = await api.patch(`/recruiter/applicants/${id}/status/`, {
      status,
      notes,
    });
    return response.data;
  },

  async getAdminApplications(params = {}) {
    const response = await api.get('/admin/applications/', { params });
    return response.data;
  },

  async getAdminApplicationDetails(id) {
    const response = await api.get(`/admin/applications/${id}/`);
    return response.data;
  },
};

export default applicationService;
