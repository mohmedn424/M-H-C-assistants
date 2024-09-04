import pb from '../lib/pocketbase';

export const isAuthenticated = () => {
  return pb.authStore.isValid;
};
