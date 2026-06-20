import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleAdmin: (id) => api.patch(`/admin/users/${id}/toggle-admin`),
  getCalculations: () => api.get('/admin/calculations'),
  createProgram: (data) => api.post('/admin/programs', data),
  updateProgram: (id, data) => api.put(`/admin/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/admin/programs/${id}`),
  getSupportRequests: () => api.get('/admin/support'),
  markSupportRead: (id) => api.patch(`/admin/support/${id}/read`),
  deleteSupportRequest: (id) => api.delete(`/admin/support/${id}`),
};
