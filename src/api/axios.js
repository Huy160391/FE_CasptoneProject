import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sonat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sonat_token');
      localStorage.removeItem('sonat_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginApi = (payload) => api.post('/login', payload);
export const getUsers = () => api.get('/users');
export const createUser = (payload) => api.post('/users', payload);
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export const createOrder = (payload) => api.post('/orders', payload);
export const getOrder = (id) => api.get(`/orders/${id}`);
export const addItem = (orderId, payload) => api.post(`/orders/${orderId}/items`, payload);
export const updateItemPrice = (orderId, itemId, payload) =>
  api.put(`/orders/${orderId}/items/${itemId}`, payload);
export const submitOrder = (orderId) => api.post(`/orders/${orderId}/submit`);

export const getDebts = (role) =>
  role === 'chef' ? api.get('/chef/debts') : api.get('/debts/me');
export const payDebt = (id) => api.post(`/debts/${id}/pay`);
export const confirmDebt = (id) => api.post(`/debts/${id}/confirm`);

export const changePassword = (payload) => api.post('/change-password', payload);

export default api;
