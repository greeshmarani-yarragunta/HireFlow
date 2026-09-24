import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login/', { email, password });
    if (response.data.access) {
      localStorage.setItem('hireflow_access_token', response.data.access);
      localStorage.setItem('hireflow_refresh_token', response.data.refresh);
      localStorage.setItem('hireflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async registerCandidate(candidateData) {
    const response = await api.post('/auth/register/candidate/', candidateData);
    return response.data;
  },

  async registerRecruiter(recruiterData) {
    const response = await api.post('/auth/register/recruiter/', recruiterData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  async updateCurrentUser(data) {
    const response = await api.patch('/auth/me/', data);
    return response.data;
  },

  async getCandidateProfile() {
    const response = await api.get('/candidate/profile/');
    return response.data;
  },

  async updateCandidateProfile(data) {
    const isFormData = data instanceof FormData;
    const response = await api.put('/candidate/profile/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  async getRecruiterProfile() {
    const response = await api.get('/recruiter/profile/');
    return response.data;
  },

  async updateRecruiterProfile(data) {
    const isFormData = data instanceof FormData;
    const response = await api.put('/recruiter/profile/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('hireflow_access_token');
    localStorage.removeItem('hireflow_refresh_token');
    localStorage.removeItem('hireflow_user');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('hireflow_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};

export default authService;
