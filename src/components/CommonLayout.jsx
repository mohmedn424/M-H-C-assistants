import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Tabs } from 'antd-mobile';

import { FloatingPanel } from 'antd-mobile';
import { Layout } from 'antd';
import AddToQueueModal from './AddToQueue';
import { useEffect, useRef } from 'react';
import {
  useClinicsStore,
  useCurrentRoute,
  useDoctorsStore,
  useFloatingPanelState,
} from '../stores/userStore';

const clinics = useClinicsStore.getState().clinics;
const doctors = useDoctorsStore.getState().doctors;

export const height =
  clinics?.length > 1 || doctors?.length > 2
    ? window.innerHeight * 0.9
    : window.innerHeight * 0.7;

const anchors = [90, height];

export default function CommonLayout({ children }) {
  const floatingRef = useRef(null);

  const { path, setPath, setFullPath } = useCurrentRoute();
  const router = useRouterState();

  const { closeFloat, isFloatOpen, setIsFloatOpen, setFloatingRef } =
    useFloatingPanelState();
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
      <FloatingPanel
        onHeightChange={(e) => {
          if (e === 90 || e < height / 2) {
            setIsFloatOpen(false);
          } else setIsFloatOpen(true);
        }}
        anchors={anchors}
        ref={floatingRef}
      >
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
