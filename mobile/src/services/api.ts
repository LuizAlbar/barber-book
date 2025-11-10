import axios from 'axios';

const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'
  : 'https://your-production-url.com/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const authService = {
  signup: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const barbershopService = {
  create: async (data: any) => {
    const response = await api.post('/barbershops', data);
    return response.data;
  },
  list: async (page = 1) => {
    const response = await api.get(`/barbershops?page=${page}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/barbershops/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/barbershops/${id}`, data);
    return response.data;
  },
};

export const appointmentService = {
  create: async (data: any) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },
  list: async (barbershopId: string, date?: string, page = 1) => {
    const params = new URLSearchParams({ barbershopId, page: page.toString() });
    if (date) params.append('date', date);
    const response = await api.get(`/appointments?${params}`);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },
};

export const capitalService = {
  create: async (data: any) => {
    const response = await api.post('/capital', data);
    return response.data;
  },
  list: async (barbershopId: string, type?: string, page = 1) => {
    const params = new URLSearchParams({ barbershopId, page: page.toString() });
    if (type) params.append('type', type);
    const response = await api.get(`/capital?${params}`);
    return response.data;
  },
};

export const serviceService = {
  create: async (data: any) => {
    const response = await api.post('/services', data);
    return response.data;
  },
  list: async (barbershopId: string, page = 1) => {
    const response = await api.get(`/services?barbershopId=${barbershopId}&page=${page}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/services/${id}`);
  },
};
