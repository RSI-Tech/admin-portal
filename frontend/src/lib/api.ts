import axios, { AxiosError } from 'axios';

// Use relative URL in production so it goes through IIS proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:8011');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle authentication errors
      console.error('Authentication error');
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// User API calls
export const userApi = {
  // Get all users with optional filters
  getUsers: async (params?: {
    search?: string;
    user_type?: string;
    status?: string;
    profile_id?: string;
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get('/api/users/', { params });
    return response.data;
  },

  // Get single user
  getUser: async (userKey: number) => {
    const response = await api.get(`/api/users/${userKey}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: any) => {
    const response = await api.post('/api/users/', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userKey: number, userData: any) => {
    const response = await api.put(`/api/users/${userKey}`, userData);
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userKey: number, status: 'Active' | 'Inactive') => {
    const response = await api.patch(`/api/users/${userKey}/status`, { status });
    return response.data;
  },

  // Delete user (soft delete)
  deleteUser: async (userKey: number) => {
    const response = await api.delete(`/api/users/${userKey}`);
    return response.data;
  },
};

// Profile API calls
export const profileApi = {
  // Get all profiles
  getProfiles: async () => {
    const response = await api.get('/api/profiles/');
    return response.data;
  },

  // Get user profiles
  getUserProfiles: async (userKey: number) => {
    const response = await api.get(`/api/profiles/users/${userKey}`);
    return response.data;
  },

  // Update user profiles
  updateUserProfiles: async (userKey: number, profileIds: string[], updatedBy: string = 'SYSTEM') => {
    const response = await api.put(`/api/profiles/users/${userKey}`, {
      profile_ids: profileIds,
      updated_by: updatedBy,
    });
    return response.data;
  },
};

// Environment API calls
export const environmentApi = {
  // Get current environment
  getEnvironment: async () => {
    const response = await api.get('/api/environment/');
    return response.data;
  },

  // Get all available environments
  getEnvironments: async () => {
    const response = await api.get('/api/environment/list');
    return response.data;
  },

  // Set environment
  setEnvironment: async (environment: string) => {
    const response = await api.post('/api/environment/', { environment });
    return response.data;
  },
};

export default api;