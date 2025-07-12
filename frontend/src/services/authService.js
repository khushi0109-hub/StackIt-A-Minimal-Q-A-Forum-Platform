import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token: resetData.token,
        password: resetData.password,
        confirmPassword: resetData.confirmPassword
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user stats (for profile page)
  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (formData) => {
    try {
      const response = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (password) => {
    try {
      const response = await api.delete('/auth/delete-account', {
        data: { password }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout (clear token from server if needed)
  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      // Even if server request fails, clear local token
      localStorage.removeItem('token');
      throw error;
    }
  },

  // Check if token is valid
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/users?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Ban/unban user (admin only)
  toggleUserBan: async (userId, banned) => {
    try {
      const response = await api.put(`/users/${userId}/ban`, { banned });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Make user admin (admin only)
  toggleUserAdmin: async (userId, isAdmin) => {
    try {
      const response = await api.put(`/users/${userId}/admin`, { isAdmin });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;