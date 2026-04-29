import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${API_BASE_URL}/api/auth`;

const normalizeAvatar = (user) => {
  if (!user) return null;
  if (user.avatar?.includes('name=User')) {
    return {
      ...user,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`
    };
  }
  return user;
};

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('user');
    return normalizeAvatar(raw ? JSON.parse(raw) : null);
  } catch {
    return null;
  }
})();

const useAuthStore = create((set) => ({
  user: storedUser,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const userData = normalizeAvatar(response.data);
      set({ user: userData, token: userData.token, loading: false });
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      return true;
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        set({ loading: false });
        return error.response.data;
      }
      set({ error: error.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/register`, { name, email, password });
      set({ loading: false });
      return response.data; // Return data so component can handle redirect
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', loading: false });
      return false;
    }
  },

  googleLogin: async (idToken) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/google-login`, { idToken });
      const userData = normalizeAvatar(response.data);
      set({ user: userData, token: userData.token, loading: false });
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message || 'Google login failed', loading: false });
      return false;
    }
  },

  setError: (message) => set({ error: message }),

  verifyEmail: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, { email, otp });
      const userData = normalizeAvatar(response.data);
      set({ user: userData, token: userData.token, loading: false });
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message || 'Verification failed', loading: false });
      return false;
    }
  },

  resendOTP: async (email) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/resend-otp`, { email });
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to resend OTP', loading: false });
      return false;
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/profile`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const userData = normalizeAvatar(response.data);
      set({ user: userData, loading: false });
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Profile update failed', loading: false });
      return false;
    }
  },

  requestPasswordOtp: async () => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/request-password-otp`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to request OTP', loading: false });
      return false;
    }
  },

  verifyPasswordOtp: async (otp, newPassword) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/verify-password-otp`, { otp, newPassword }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Password update failed', loading: false });
      return false;
    }
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/change-password`, { 
        currentPassword, 
        newPassword, 
        confirmPassword 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Password change failed', loading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
