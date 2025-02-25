import create from 'zustand';
import pb from '../lib/pocketbase';

export const useAuthStore = create((set) => ({
  isAuthenticated: pb.authStore.isValid,
  user: pb.authStore.model,
  setAuth: (authData) => {
    set({ isAuthenticated: true, user: authData });
  },
  clearAuth: () => {
    pb.authStore.clear();
    set({ isAuthenticated: false, user: null });
  },
  syncAuth: () => {
    set({
      isAuthenticated: pb.authStore.isValid,
      user: pb.authStore.model,
    });
  },
}));

// Subscribe to PocketBase auth changes
pb.authStore.onChange(() => {
  useAuthStore.getState().syncAuth();
});
