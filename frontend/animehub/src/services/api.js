import axios from 'axios';

/**
 * 1. DYNAMIC BASE URL
 * It tries to use the VITE environment variable first. 
 * If that's missing (like during a local build), it defaults to Render.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://neo-akibara-backend.onrender.com';
const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/**
 * 2. REQUEST INTERCEPTOR
 * Automatically injects the JWT token from localStorage into every request.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 3. AUTH SERVICE
 * Centralized logic for authentication using the 'api' instance.
 */
export const authService = {
  // Login user
  async login(email, password) {
    try {
      console.log('🔐 Syncing with Neural Link at:', API_URL);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token); 
        return { success: true, user: response.data.user, token: response.data.token };
      }
      return { success: false, error: { message: response.data.error || 'Login failed' } };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || { message: 'Login failed' } };
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        return { success: true, user: response.data.user, token: response.data.token };
      }
      return { success: false, error: { message: response.data.error || 'Registration failed' } };
    } catch (error) {
      return { success: false, error: error.response?.data || { message: 'Registration failed' } };
    }
  },

  // Check current session status
  async checkAuth() {
    try {
      const response = await api.get('/auth/me');
      return { success: true, user: response.data.data };
    } catch (error) {
      this.clearLocalAuth();
      return { success: false, error: 'Not authenticated' };
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      this.clearLocalAuth();
    }
  },

  // Helper to clear local storage
  clearLocalAuth() {
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