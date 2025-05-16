import {
  memo,
  useEffect,
  useCallback,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useWaitlist } from '../stores/queueStore';
import QueueCard from './QueueCard';
import WaitListCard from './WaitListCard';
import { motion } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { useWindowSize } from '../hooks/useWindowSize';

// Simplified animation variants with better performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

export default memo(function Waitlist() {
  const { waitlist } = useWaitlist();
  const windowSize = useWindowSize();
  const [listHeight, setListHeight] = useState(
    window.innerHeight - 200
  );
  const [isReady, setIsReady] = useState(false);
  const prevWaitlistRef = useRef([]);
  const listRef = useRef(null);
  const [listKey, setListKey] = useState(0); // Add key to force re-render when needed

  // Memoize the header height calculation
  const updateScrollPadding = useCallback(() => {
    const height =
      document.querySelector('.header-card')?.clientHeight || 0;

    const columnElement = document.querySelector('.column');
    if (columnElement) {
      columnElement.style.scrollPaddingTop = `${height}px`;
    }

    // Update list height based on available space
    setListHeight(window.innerHeight - 200 - height);
  }, []);

  useEffect(() => {
    updateScrollPadding();
    // Use RAF for smoother initialization
    requestAnimationFrame(() => {
      setIsReady(true);
    });
  }, [updateScrollPadding]);

  // Update dimensions when window size changes
  useEffect(() => {
    updateScrollPadding();
  }, [windowSize, updateScrollPadding]);

  // Check if waitlist has changed significantly to reset virtualized list
  useEffect(() => {
    const prevIds = new Set(
      prevWaitlistRef.current.map((item) => item.id)
    );
    const currentIds = new Set(waitlist.map((item) => item.id));

    // If items were added or removed (not just reordered)
    if (prevIds.size !== currentIds.size) {
      if (listRef.current) {
        listRef.current.scrollTo(0);
        // Remove the resetAfterIndex call as it doesn't exist on FixedSizeList
        // Force re-render of the list by changing key
        setListKey((prev) => prev + 1);
      }
    }

    prevWaitlistRef.current = waitlist;
  }, [waitlist]);

  // Row renderer for virtualized list with better key handling
  const Row = useCallback(
    ({ index, style }) => {
      const item = waitlist[index];
      if (!item) return null;

      // Use composite key for better identification
      const compositeKey = `${item.id}-${item.status}`;

      return (
        <div style={{ ...style, height: 'auto' }}>
          <QueueCard key={compositeKey} data={item} index={index} />
        </div>
      );
    },
    [waitlist]
  );

  // Memoize the list component to prevent unnecessary re-renders
  const VirtualList = useMemo(() => {
    if (waitlist.length === 0) {
      return (
        <div className="empty-list">
          لا يوجد مرضى في قائمة الانتظار
        </div>
      );
    }

    return (
      <div
        style={{
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <List
          ref={listRef}
          height={listHeight}
          itemCount={waitlist.length}
          itemSize={120}
          width="100%"
          overscanCount={5}
          key={listKey} // Add key to force re-render when needed
        >
          {Row}
        </List>
      </div>
    );
  }, [waitlist, listHeight, Row, isReady, listKey]); // Add listKey to dependencies

  return (
    <>
      <WaitListCard />
      <div className="column">
        <motion.div
          className="cards-wrapper"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          {VirtualList}
        </motion.div>
      </div>
    </>
  );
});
