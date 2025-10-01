import {create} from 'zustand'
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axiosInstance.get('/auth/check-auth');
      set({ authUser: response.data });
      get().connectSocket();
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post('/auth/signup', formData);
      set({ authUser: response.data });
      toast.success('Account Created successfully!');
      get().connectSocket();
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post('/auth/login', formData);
      set({ authUser: response.data });
      toast.success('Logged in successfully!');
      get().connectSocket();
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully!');
      get().disconnectSocket();
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(error.response?.data?.message || 'Logout failed. Please try again.');
    }
  },

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const response = await axiosInstance.put('/auth/update-profile', formData);
      set({ authUser: response.data });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Profile update failed. Please try again.');
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id
      }
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (onlineUsers) => {
      set({ onlineUsers });
    });

  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

}));
