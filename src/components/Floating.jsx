import { FloatingPanel } from 'antd-mobile';
import React, { useEffect, useRef, useCallback } from 'react';
import { useFloatingPanelState } from '../stores/userStore';
import AddToQueueModal from './AddToQueue';

export const height = window.innerHeight * 0.8;
const ANCHORS = [100, height];
const COLLAPSE_THRESHOLD = height / 6;

export default function Floating() {
  const floatingRef = useRef(null);
  const { setIsFloatOpen, setFloatingRef } = useFloatingPanelState();

  useEffect(() => {
    if (floatingRef.current) {
      setFloatingRef(floatingRef.current);
    }
  }, [setFloatingRef]);

  const handleHeightChange = useCallback(
    (currentHeight) => {
      setIsFloatOpen(currentHeight > COLLAPSE_THRESHOLD);
      if (currentHeight > height / 2 && floatingRef.current) {
        floatingRef.current.setHeight(height);
      }
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
