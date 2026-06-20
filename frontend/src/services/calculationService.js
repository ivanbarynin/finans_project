import api from './api';

export const calculationService = {
  save: (params, result) =>
    api.post('/calculations', { params, result }),

  getAll: () =>
    api.get('/calculations'),

  delete: (id) =>
    api.delete(`/calculations/${id}`),
};
