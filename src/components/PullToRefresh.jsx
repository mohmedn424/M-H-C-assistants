import React, { useCallback, useState } from 'react';
import { PullToRefresh as AntdPullToRefresh } from 'antd-mobile';
import { fetchQueueLogic } from '../stores/queueStore';
import { message } from 'antd';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PullToRefresh = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get the update service worker function from the PWA hook with proper destructuring
  const {
    needRefresh: [needRefresh, closeNeedRefresh],
    updateServiceWorker,
    registerSW,
  } = useRegisterSW({
    immediate: true,
    onRegistered(r) {
      console.log('SW registered successfully');
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  // Force check for updates when pulling to refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return false;

    setIsRefreshing(true);
    try {
      // First, check for content updates
      await fetchQueueLogic();

      // Try to update content first
      let contentUpdated = true;

      // Then check for PWA updates - handle potential errors separately
      try {
        // Force check for PWA updates
        await registerSW(true);

        // Small delay to allow update check to complete
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Then apply update if available
        if (needRefresh) {
          const updated = await updateServiceWorker(true);
          if (closeNeedRefresh) closeNeedRefresh();
          if (updated) {
            message.success('تم تحديث التطبيق والمحتوى');
            return true;
          }
        }
      } catch (pwaError) {
        console.log(
          'PWA update check error (non-critical):',
          pwaError
        );
        // Continue with content update even if PWA update fails
      }

      // If we got here, at least the content was updated
      if (contentUpdated) {
        message.success('تم التحديث');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing content:', error);
      message.error('فشل التحديث');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [
    updateServiceWorker,
    needRefresh,
    closeNeedRefresh,
    registerSW,
    isRefreshing,
  ]);

  return (
    <AntdPullToRefresh
      onRefresh={handleRefresh}
      renderText={(status) => {
        return {
          pulling: needRefresh
            ? 'اسحب لتحت عشان تحدث التطبيق'
            : 'اسحب لتحت عشان تحدث',
          canRelease: 'سيب عشان تحدث',
          refreshing: 'بيحدث...',
          complete: 'تم التحديث',
        }[status];
      }}
      style={{
        color: 'white',
        touchAction: 'none',
      }}
    >
      {children}
    </AntdPullToRefresh>
  );
};

export default PullToRefresh;
