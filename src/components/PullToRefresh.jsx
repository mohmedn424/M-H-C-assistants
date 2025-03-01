import React from 'react';
import { PullToRefresh as AntdPullToRefresh } from 'antd-mobile';
import { fetchQueueLogic } from '../stores/queueStore';
import { message } from 'antd';

const PullToRefresh = ({ children }) => {
  const handleRefresh = async () => {
    try {
      await fetchQueueLogic();
      message.success('تم التحديث');
      return true;
    } catch (error) {
      console.error('Error refreshing content:', error);
      message.error('فشل التحديث');
      return false;
    }
  };

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
        touchAction: 'none', // Add this line
      }}
    >
      {children}
    </AntdPullToRefresh>
  );
};

export default PullToRefresh;
