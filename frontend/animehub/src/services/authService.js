import api from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token); 
        return { success: true, user: response.data.user };
      }
      return { success: false, error: response.data.error || 'Login failed' };
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
      return { success: false, error: response.data.error || 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  },

  async checkAuth() {
    try {
      const response = await api.get('/auth/me');
      return { success: true, user: response.data.data };
    } catch (error) {
      this.logoutLocal();
      return { success: false };
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      this.logoutLocal();
    }
  },

  logoutLocal() {
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