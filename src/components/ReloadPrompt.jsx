import { Modal } from 'antd-mobile';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect, useRef } from 'react';

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
    registerSW,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered');

      // Use a more battery-friendly update strategy
      // Check when the user interacts with the app
      const checkForUpdates = () => {
        console.log('Checking for updates...');
        r?.update();
      };

      // Check less frequently (every 5 minutes instead of every minute)
      const intervalId = setInterval(checkForUpdates, 300000);

      // Also check when the app comes back to foreground
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkForUpdates();
        }
      });

      // Store the interval ID for cleanup
      window.updateCheckInterval = intervalId;
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
    immediate: true,
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  // Listen for messages from service worker
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'CONTENT_UPDATED') {
        console.log('New content available!');
        setNeedRefresh(true);
      }

      if (
        event.data &&
        event.data.type === 'NEW_VERSION_INSTALLING'
      ) {
        console.log('New version installing...');
        // You could show a different notification here
      }
    };

    navigator.serviceWorker.addEventListener(
      'message',
      handleMessage
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        'message',
        handleMessage
      );

      // Clean up the interval when component unmounts
      if (window.updateCheckInterval) {
        clearInterval(window.updateCheckInterval);
      }
    };
  }, [setNeedRefresh]);

  return needRefresh ? (
    <Modal
      content="New content available, click reload to update."
      closeOnAction
      onAction={handleUpdate}
      actions={[{ text: 'Reload', primary: true }]}
    />
  ) : null;
}

export default ReloadPrompt;
