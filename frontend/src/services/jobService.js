import api from './api';

export const jobService = {
  async getPlatformStats() {
    const response = await api.get('/platform-stats/');
    return response.data;
  },

  async getPublicJobs(params = {}) {
    const response = await api.get('/jobs/', { params });
    return response.data;
  },

  async getJobDetails(id) {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
  },

  async getRecruiterJobs(params = {}) {
    const response = await api.get('/recruiter/jobs/', { params });
    return response.data;
  },

  async getRecruiterJobDetails(id) {
    const response = await api.get(`/recruiter/jobs/${id}/`);
    return response.data;
  },

  async createJob(jobData) {
    const response = await api.post('/recruiter/jobs/', jobData);
    return response.data;
  },

  async updateJob(id, jobData) {
    const response = await api.put(`/recruiter/jobs/${id}/`, jobData);
    return response.data;
  },

  async patchJob(id, partialData) {
    const response = await api.patch(`/recruiter/jobs/${id}/`, partialData);
    return response.data;
  },

  async deleteJob(id) {
    const response = await api.delete(`/recruiter/jobs/${id}/`);
    return response.data;
  },

  async getSavedJobs(params = {}) {
    const response = await api.get('/candidate/saved-jobs/', { params });
    return response.data;
  },

  async saveJob(jobId) {
    const response = await api.post('/candidate/saved-jobs/', { job_id: jobId });
    return response.data;
  },

  async unsaveJob(jobId) {
    const response = await api.delete(`/candidate/saved-jobs/${jobId}/`);
    return response.data;
  },
};

export default jobService;
