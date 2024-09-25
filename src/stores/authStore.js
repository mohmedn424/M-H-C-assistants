import create from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  setAuth: (authData) =>
    set({ isAuthenticated: true, user: authData }),
  clearAuth: () => set({ isAuthenticated: false, user: null }),
}));
