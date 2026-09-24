import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/');
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users/', { params });
    return response.data;
  },

  async toggleUserStatus(userId) {
    const response = await api.patch(`/admin/users/${userId}/toggle-status/`);
    return response.data;
  },

  async getAdminJobs(params = {}) {
    const response = await api.get('/admin/jobs/', { params });
    return response.data;
  },

  async reviewJob(jobId, action, adminFeedback = '') {
    const response = await api.patch(`/admin/jobs/${jobId}/review/`, {
      action,
      admin_feedback: adminFeedback,
    });
    return response.data;
  },
};

export default adminService;
