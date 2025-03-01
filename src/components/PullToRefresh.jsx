import React, { useCallback } from 'react';
import { PullToRefresh as AntdPullToRefresh } from 'antd-mobile';
import { fetchQueueLogic } from '../stores/queueStore';
import { message } from 'antd';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PullToRefresh = ({ children }) => {
  // Get the update service worker function from the PWA hook
  const { updateServiceWorker, needRefresh } = useRegisterSW();

  const handleRefresh = useCallback(async () => {
    try {
      // First, check for content updates
      await fetchQueueLogic();

      // Then, check for PWA updates
      const hasUpdate = needRefresh?.[0];
      if (hasUpdate) {
        // If there's an update, apply it
        await updateServiceWorker(true);
        message.success('تم تحديث التطبيق والمحتوى');
      } else {
        message.success('تم التحديث');
      }

      return true;
    } catch (error) {
      console.error('Error refreshing content:', error);
      message.error('فشل التحديث');
      return false;
    }
  }, [updateServiceWorker, needRefresh]);

  return (
    <AntdPullToRefresh
      onRefresh={handleRefresh}
      renderText={(status) => {
        return {
          pulling: 'اسحب لتحت عشان تحدث',
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
