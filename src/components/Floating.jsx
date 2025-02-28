import { FloatingPanel } from 'antd-mobile';
import React, { useEffect, useRef, useCallback, memo } from 'react';
import { useFloatingPanelState } from '../stores/userStore';
import AddToQueueModal from './AddToQueue';
import { motion } from 'framer-motion';

// Constants moved outside component to prevent recreation
export const height = window.innerHeight * 0.8;
const ANCHORS = [100, height];
const COLLAPSE_THRESHOLD = height / 2;

const Floating = memo(function Floating() {
  const floatingRef = useRef(null);
  const { setIsFloatOpen, setFloatingRef } = useFloatingPanelState();

  useEffect(() => {
    if (floatingRef.current) {
      setFloatingRef(floatingRef.current);
    }

    return () => {
      setFloatingRef(null);
    };
  }, [setFloatingRef]);

  const handleHeightChange = useCallback(
    (height) => {
      setIsFloatOpen(height > COLLAPSE_THRESHOLD);
    },
    [setIsFloatOpen]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        width: '100%',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <FloatingPanel
        onHeightChange={handleHeightChange}
        anchors={ANCHORS}
        ref={floatingRef}
        style={{
          maxWidth: '100%',
          overflow: 'hidden',
        }}
        disableBodyScroll={true}
      >
        <AddToQueueModal />
      </FloatingPanel>
    </motion.div>
  );
});

export default Floating;
