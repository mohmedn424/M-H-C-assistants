import React, { useCallback } from 'react';
import { PullToRefresh as AntdPullToRefresh } from 'antd-mobile';
import { fetchQueueLogic } from '../stores/queueStore';
import { message } from 'antd';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PullToRefresh = ({ children }) => {
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
    try {
      // First, check for content updates
      await fetchQueueLogic();

      // Force check for PWA updates
      await registerSW(true);

      // Small delay to allow update check to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Then apply update if available
      if (needRefresh) {
        await updateServiceWorker(true);
        if (closeNeedRefresh) closeNeedRefresh();
        message.success('تم تحديث التطبيق والمحتوى');
      } else {
        // Try one more time with direct update
        const updated = await updateServiceWorker(true);
        if (updated) {
          message.success('تم تحديث التطبيق والمحتوى');
        } else {
          message.success('تم التحديث');
        }
      }

      return true;
    } catch (error) {
      console.error('Error refreshing content:', error);
      message.error('فشل التحديث');
      return false;
    }
  }, [
    updateServiceWorker,
    needRefresh,
    closeNeedRefresh,
    registerSW,
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
          complete: needRefresh ? 'تم تحديث التطبيق' : 'تم التحديث',
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
