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
    router.location.pathname.split('/')[1] === ''
      ? setPath(router.location.pathname)
      : setPath(router.location.pathname.split('/')[1]);

    setFullPath(router.location.pathname);
  }, [router.location.pathname]);

  return (
    <Layout className="main-app-container">
      <div
        className="container"
        style={{
          overflowY: 'auto',
        }}
      >
        <div
          onClick={() => closeFloat()}
          className={
            isFloatOpen
              ? 'float-overlay float-overlay-open'
              : 'float-overlay'
          }
        ></div>
        {children}
      </div>

      <Floating />
      <Tabs
        className="tabs-layout"
        activeKey={path}
        style={{
          userSelect: 'none',
        }}
        onChange={(key) => {
          switch (key) {
            case '/':
              navigate({ to: '/' });
              break;
            case 'newpatient':
              navigate({ to: '/newpatient' });
              break;
            case 'settings':
              navigate({ to: '/settings' });
              break;
            default:
              break;
          }
        }}
      >
        <Tabs.Tab className="layout-tab" title="الدور" key="/" />
        <Tabs.Tab
          className="layout-tab"
          title="تسجيل"
          key="newpatient"
        />
        <Tabs.Tab
          className="layout-tab"
          title="الاعدادات"
          key="settings"
        />
      </Tabs>
    </Layout>
  );
});
