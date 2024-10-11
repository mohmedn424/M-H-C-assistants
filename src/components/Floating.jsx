import { FloatingPanel } from 'antd-mobile';
import React, { useEffect, useRef, useCallback } from 'react';
import { useFloatingPanelState } from '../stores/userStore';
import AddToQueueModal from './AddToQueue';

export const height = window.innerHeight * 0.6;
const ANCHORS = [90, height];
const COLLAPSE_THRESHOLD = height / 2;

export default function Floating() {
  const floatingRef = useRef(null);
  const { setIsFloatOpen, setFloatingRef } = useFloatingPanelState();

  useEffect(() => {
    if (floatingRef.current) {
      setFloatingRef(floatingRef.current);
    }
  }, [setFloatingRef]);

  const handleHeightChange = useCallback(
    (height) => {
      setIsFloatOpen(height > COLLAPSE_THRESHOLD);
    },
    [setIsFloatOpen]
  );

  return (
    <FloatingPanel
      onHeightChange={handleHeightChange}
      anchors={ANCHORS}
      ref={floatingRef}
    >
      <AddToQueueModal />
    </FloatingPanel>
  );
}
