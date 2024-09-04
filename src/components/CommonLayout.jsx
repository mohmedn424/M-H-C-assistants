import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Tabs } from 'antd-mobile';

import { FloatingPanel } from 'antd-mobile';
import { Layout } from 'antd';
import AddToQueueModal from './AddToQueue';
import { useEffect, useRef } from 'react';
import {
  useCurrentRoute,
  useFloatingPanelState,
} from '../stores/userStore';
const anchors = [90, window.innerHeight * 0.9];

export default function CommonLayout({ children }) {
  const floatingRef = useRef(null);

  const { path, setPath, setFullPath } = useCurrentRoute();
  const router = useRouterState();

  const { setFloatingRef } = useFloatingPanelState();
  const navigate = useNavigate();
  useEffect(() => {
    if (floatingRef.current) {
      setFloatingRef(floatingRef.current);
    }
  }, []);

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
        {children}
      </div>
      <FloatingPanel anchors={anchors} ref={floatingRef}>
        <AddToQueueModal />
      </FloatingPanel>
      <Tabs
        className="tabs-layout"
        activeKey={path}
        onChange={(key) => {
          switch (key) {
            case 'queue':
              navigate({ to: '/queue' });
              break;
            case 'newpatient':
              navigate({ to: '/newpatient' });
              break;
            case '/':
              navigate({ to: '/' });
              break;
            default:
              break;
          }
        }}
      >
        <Tabs.Tab className="layout-tab" title="الدور" key="queue" />
        <Tabs.Tab
          className="layout-tab"
          title="تسجيل"
          key="newpatient"
        />
        <Tabs.Tab className="layout-tab" title="الاعدادات" key="/" />
      </Tabs>
    </Layout>
  );
}
