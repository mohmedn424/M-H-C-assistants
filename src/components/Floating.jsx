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

  // Set floating ref once when component mounts
  useEffect(() => {
    if (floatingRef.current) {
      setFloatingRef(floatingRef.current);
    }

    // Cleanup function to prevent memory leaks
    return () => {
      setFloatingRef(null);
    };
  }, [setFloatingRef]);

  // Memoized callback to prevent recreation on each render
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
      style={{ width: '100%' }}
    >
      <FloatingPanel
        onHeightChange={handleHeightChange}
        anchors={ANCHORS}
        ref={floatingRef}
        style={{
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        <AddToQueueModal />
      </FloatingPanel>
    </motion.div>
  );
});

export default Floating;
