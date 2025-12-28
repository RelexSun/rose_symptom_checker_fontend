// Zustand store for global user state management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setAuthToken } from '@/lib/api';

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null, token: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) => {
        set({ user, token, isAuthenticated: !!user && !!token });
        setAuthToken(token);
      },
      clearUser: () => {
        set({ user: null, token: null, isAuthenticated: false });
        setAuthToken(null);
      },
    }),
    {
      name: 'user-storage', // localStorage key
    }
  )
);

