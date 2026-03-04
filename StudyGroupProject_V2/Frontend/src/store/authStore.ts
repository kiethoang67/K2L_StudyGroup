import { create } from 'zustand';
import type { User } from '../types/auth.types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
    fetchProfile: () => Promise<void>;
}

const getUserFromStorage = () => {
    try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error('Failed to parse user from storage', e);
        localStorage.removeItem('user'); // Clear corrupted data
        return null;
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    user: getUserFromStorage(),
    token: localStorage.getItem('access_token'),
    isAuthenticated: !!localStorage.getItem('access_token'),

    login: (token, user) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, user, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
    },

    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },

    fetchProfile: async () => {
        try {
            // Need to import authAPI here, but passing it might be cleaner or just use direct import since it is a static module
            const { authAPI } = await import('../api/auth.api');
            const response = await authAPI.getProfile();
            const user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            set({ user });
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    },
}));
