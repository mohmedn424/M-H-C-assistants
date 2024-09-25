import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Tabs } from 'antd-mobile';
import { Layout } from 'antd';
import { memo, useEffect } from 'react';
import {
  useCurrentRoute,
  useFloatingPanelState,
} from '../stores/userStore';
import Floating from './Floating';

export default memo(function CommonLayout({ children }) {
  const { path, setPath, setFullPath } = useCurrentRoute();
  const router = useRouterState();
  const { closeFloat, isFloatOpen } = useFloatingPanelState();
  const navigate = useNavigate();

  useEffect(() => {
    const pathSegment = router.location.pathname.split('/')[1];
    setPath(pathSegment === '' ? '/' : pathSegment);
    setFullPath(router.location.pathname);
  }, [router.location.pathname, setPath, setFullPath]);

  const handleTabChange = (key) => {
    const routes = {
      '/': '/',
      newpatient: '/newpatient',
      upload: '/upload',
      settings: '/settings',
    };
    if (routes[key]) {
      navigate({ to: routes[key] });
    }
  };

  return (
    <Layout className="main-app-container">
      <div className="container" style={{ overflowY: 'auto' }}>
        <div
          onClick={closeFloat}
          className={`float-overlay ${isFloatOpen ? 'float-overlay-open' : ''}`}
        ></div>
        {children}
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
        <Tabs.Tab className="layout-tab" title="صور" key="upload" />
        <Tabs.Tab
          className="layout-tab"
          title="الاعدادات"
          key="settings"
        />
      </Tabs>
    </Layout>
  );
});
