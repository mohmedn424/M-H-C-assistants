import { create } from 'zustand';
import pb from '../lib/pocketbase';

/**
 * Authentication store to manage user authentication state
 */
export const useAuthStore = create((set) => ({
  // Initial state from PocketBase
  isAuthenticated: pb.authStore.isValid,
  user: pb.authStore.model,

  // Set authentication data when user logs in
  setAuth: (authData) => {
    set({
      isAuthenticated: true,
      user: authData,
    });
  },

  // Clear authentication data when user logs out
  clearAuth: () => {
    pb.authStore.clear();
    set({
      isAuthenticated: false,
      user: null,
    });
  },

  // Sync store with PocketBase auth state
  syncAuth: () => {
    set({
      isAuthenticated: pb.authStore.isValid,
      user: pb.authStore.model,
    });
  },
}));

// Create a single subscription to PocketBase auth changes
// This avoids creating multiple listeners if this file is imported multiple times
let hasSetupAuthListener = false;

if (!hasSetupAuthListener) {
  pb.authStore.onChange(() => {
    useAuthStore.getState().syncAuth();
  });

  hasSetupAuthListener = true;
}
