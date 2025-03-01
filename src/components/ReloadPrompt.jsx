import { Modal } from 'antd-mobile';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useCallback, memo } from 'react';

// Memoize the component to prevent unnecessary re-renders
const ReloadPrompt = memo(function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.log('SW Registered');
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
    // Add immediate registration for faster PWA initialization
    immediate: true,
  });

  // Memoize the update handler to prevent recreation on each render
  const handleUpdate = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);
  // Only render the modal when needed
  if (!needRefresh) return null;

  return (
    <Modal
      content="New content available, click reload to update."
      closeOnAction
      onAction={handleUpdate}
      actions={[{ text: 'Reload', primary: true }]}
      // Add aria attributes for accessibility
      aria-live="polite"
      aria-labelledby="app-update-title"
    />
  );
});

export default ReloadPrompt;
