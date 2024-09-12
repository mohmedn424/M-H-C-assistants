import { FloatingPanel } from 'antd-mobile';
import React, { useEffect, useRef } from 'react';
import { useFloatingPanelState } from '../stores/userStore';
import AddToQueueModal from './AddToQueue';

export const height = window.innerHeight * 0.8;

const anchors = [90, height];

export default function Floating() {
  const floatingRef = useRef(null);
  const { setIsFloatOpen, setFloatingRef } = useFloatingPanelState();

  useEffect(() => {
    if (floatingRef.current) {
      setFloatingRef(floatingRef.current);
    }
  }, []);

  return (
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
  );
}
