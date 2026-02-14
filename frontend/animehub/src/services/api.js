import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://neo-akibara-backend.onrender.com';
const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for cross-site HttpOnly cookies
});

// 1. REQUEST INTERCEPTOR: Attach Access Token from memory/storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. RESPONSE INTERCEPTOR: The "Silent Refresh" Logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired (401) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to get a new accessToken using the refreshToken cookie
        const { data } = await axios.get(`${API_URL}/auth/refresh`, {
          withCredentials: true,
        });

        const newAccessToken = data.accessToken;
        localStorage.setItem('token', newAccessToken);

        // Retry the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, the session is dead (hijacked or expired)
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);



// 3. AUTH SERVICE LOGIC
export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        // Matching backend key: .accessToken
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
  }
};

export default api;