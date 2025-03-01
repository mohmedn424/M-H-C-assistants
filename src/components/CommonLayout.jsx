import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Tabs } from 'antd-mobile';
import { Layout } from 'antd';
import { memo, useEffect, useCallback, useMemo } from 'react';
import {
  useCurrentRoute,
  useFloatingPanelState,
} from '../stores/userStore';
import Floating from './Floating';
import { useAppHeight } from '../hooks/useAppHeight';
import PullToRefresh from './PullToRefresh';

export default memo(function CommonLayout({ children }) {
  const { path, setPath, setFullPath } = useCurrentRoute();
  const router = useRouterState();
  const { closeFloat, isFloatOpen } = useFloatingPanelState();
  const navigate = useNavigate();

  // Use the app height hook to handle mobile keyboard adjustments
  useAppHeight();

  // Memoize route update logic
  useEffect(() => {
    const pathSegment = router.location.pathname.split('/')[1];
    setPath(pathSegment === '' ? '/' : pathSegment);
    setFullPath(router.location.pathname);
  }, [router.location.pathname, setPath, setFullPath]);

  // Handle back button for floating panel
  useEffect(() => {
    // Only add listener if panel is open
    if (!isFloatOpen) return;

    const handleBackButton = (event) => {
      event.preventDefault();
      closeFloat();
    };

    window.addEventListener('popstate', handleBackButton);
    return () =>
      window.removeEventListener('popstate', handleBackButton);
  }, [isFloatOpen, closeFloat]);

  // Memoize tab routes
  const routes = useMemo(
    () => ({
      '/': '/',
      newpatient: '/newpatient',
      upload: '/upload',
      settings: '/settings',
    }),
    []
  );

  // Memoize tab change handler
  const handleTabChange = useCallback(
    (key) => {
      if (routes[key]) {
        navigate({ to: routes[key] });
      }
    },
    [navigate, routes]
  );

  // Memoize overlay class name
  const overlayClassName = useMemo(
    () => `float-overlay ${isFloatOpen ? 'float-overlay-open' : ''}`,
    [isFloatOpen]
  );

  return (
    <Layout className="main-app-container">
      <div className="container" style={{ overflowY: 'auto' }}>
        <div onClick={closeFloat} className={overlayClassName} />
        <PullToRefresh>{children}</PullToRefresh>
      </div>

      <Floating />
      <Tabs
        className="tabs-layout"
        activeKey={path}
        style={{ userSelect: 'none' }}
        onChange={handleTabChange}
      >
        <Tabs.Tab className="layout-tab" title="الدور" key="/" />
        <Tabs.Tab
          className="layout-tab"
          title="تسجيل"
          key="newpatient"
        />
        {/* <Tabs.Tab
          className="layout-tab"
          title="فحوصات"
          key="upload"
        /> */}
        <Tabs.Tab
          className="layout-tab"
          title="الاعدادات"
          key="settings"
        />
      </Tabs>
    </Layout>
  );
});
