import { create } from 'zustand';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
};

type AuthState = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
