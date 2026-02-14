import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://neo-akibara-backend.onrender.com';
const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.get(`${API_URL}/auth/refresh`, { withCredentials: true });
        localStorage.setItem('token', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        this._setSession(response.data.accessToken, response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.success) {
        this._setSession(response.data.accessToken, response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Signup failed' };
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },

  _setSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // FIXED: Added for use in CartContext and other guards
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export default api;