import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
  city?: string;
  department?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  registerOfficial: (iin: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('aqylqala_token'),
  isLoading: true,

  login: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      localStorage.setItem('aqylqala_token', token);
      set({ token, user, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      localStorage.setItem('aqylqala_token', token);
      set({ token, user, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  registerOfficial: async (iin, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', { iin, password, role: 'OFFICIAL' });
      const { token, user } = response.data;
      localStorage.setItem('aqylqala_token', token);
      set({ token, user, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('aqylqala_token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('aqylqala_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, isLoading: false });
    } catch {
      localStorage.removeItem('aqylqala_token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
