import axios from 'axios';

// 1. DYNAMIC BASE URL
// Uses Render for production and can fallback to a VITE variable if needed.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://neo-akibara-backend.onrender.com';
const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 2. INTERCEPTOR
// Automatically attaches your token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. AUTH SERVICE LOGIC
// Combined directly here to simplify imports.
export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token); 
        return { success: true, user: response.data.user };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Login failed' };
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        return { success: true, user: response.data.user };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Signup failed' };
    }
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token'); 
  }
};

export default api;