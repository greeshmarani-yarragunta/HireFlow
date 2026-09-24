import api from './api';

export const interviewService = {
  async getCandidateInterviews(params = {}) {
    const response = await api.get('/candidate/interviews/', { params });
    return response.data;
  },

  async getCandidateInterviewDetails(id) {
    const response = await api.get(`/candidate/interviews/${id}/`);
    return response.data;
  },

  async getRecruiterInterviews(params = {}) {
    const response = await api.get('/recruiter/interviews/', { params });
    return response.data;
  },

  async scheduleInterview(interviewData) {
    const response = await api.post('/recruiter/interviews/', interviewData);
    return response.data;
  },

  async updateInterview(id, updateData) {
    const response = await api.patch(`/recruiter/interviews/${id}/`, updateData);
    return response.data;
  },

  async getAdminInterviews(params = {}) {
    const response = await api.get('/admin/interviews/', { params });
    return response.data;
  },
};

export default interviewService;
