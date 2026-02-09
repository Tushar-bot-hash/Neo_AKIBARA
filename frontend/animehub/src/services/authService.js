import axios from 'axios';

// 1. IMPROVED BASE URL LOGIC
// Checks for the VITE variable, otherwise uses your Render URL as the primary production fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://neo-akibara-backend.onrender.com';
const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 2. INTERCEPTOR (Your existing logic is solid)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Login user
  async login(email, password) {
    try {
      console.log('🔐 Attempting login at:', API_URL);
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

  // ... (keep the rest of your register, checkAuth, and logout methods as they were)
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token'); 
  }
};

export default api;