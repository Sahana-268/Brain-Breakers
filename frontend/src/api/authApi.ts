import api from './axiosInstance';

export const authApi = {
  register: (data: object) => api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

