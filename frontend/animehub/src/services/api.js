// Detect the environment and set the base URL accordingly
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const productService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/products`, {
      headers: getHeaders()
    });
    return response.json();
  },
  
  create: async (productData) => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return response.json();
  },
  
  update: async (id, productData) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  }
};

export const adminService = {
  getStats: async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders()
    });
    return response.json();
  },
  
  getUsers: async () => {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getHeaders()
    });
    return response.json();
  },
  
  getAllOrders: async () => {
    const response = await fetch(`${API_URL}/orders/admin/all`, {
      headers: getHeaders()
    });
    return response.json();
  }
};

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders()
    });
    return response.json();
  }
};