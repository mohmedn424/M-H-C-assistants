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
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { useWindowSize } from '../hooks/useWindowSize';
import EmptyList from './EmptyList';

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

  // Add the effect inside the component function
  useEffect(() => {
    // Only reset the list when items are added or removed, not when they're updated
    const prevIds = new Set(
      prevWaitlistRef.current.map((item) => item.id)
    );
    const currentIds = new Set(waitlist.map((item) => item.id));

    // Check if items were added or removed (not just updated)
    const itemsAdded = waitlist.some((item) => !prevIds.has(item.id));
    const itemsRemoved = prevWaitlistRef.current.some(
      (item) => !currentIds.has(item.id)
    );

    if (itemsAdded || itemsRemoved) {
      if (listRef.current) {
        listRef.current.scrollTo(0);
        setListKey((prev) => prev + 1);
      }
    }

    prevWaitlistRef.current = waitlist;
  }, [waitlist]);

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
  // Add a function to handle scroll with haptic feedback
  const handleScroll = useCallback(() => {
    // Optional subtle feedback on scroll
    if (navigator.vibrate && Math.random() < 0.05) {
      // Only vibrate occasionally during scroll
      navigator.vibrate(5); // Very subtle vibration
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const columnElement = document.querySelector('.column');
    if (columnElement) {
      columnElement.addEventListener('scroll', handleScroll, {
        passive: true,
      });
    }

    return () => {
      if (columnElement) {
        columnElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  const Row = useCallback(
    ({ index, style }) => {
      const item = waitlist[index];
      if (!item) return null;

      // Use composite key for better identification
      const compositeKey = `${item.id}-${item.status}`;

      return (
        <div
          style={{ ...style, height: 'auto' }}
          onTouchStart={() => {
            // Optional subtle feedback on touch
            if (navigator.vibrate) {
              navigator.vibrate(10); // Very subtle vibration
            }
          }}
        >
          <QueueCard key={compositeKey} data={item} index={index} />
        </div>
      );
    },
    [waitlist]
  );

  // Memoize the list component to prevent unnecessary re-renders
  const VirtualList = useMemo(() => {
    if (waitlist.length === 0) {
      return <EmptyList message="لا يوجد مرضى في قائمة الانتظار" />;
    }

    return (
      <div
        style={{
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.2s ease',
          willChange: 'opacity', // Add will-change for better performance
        }}
      >
        <List
          ref={listRef}
          height={listHeight}
          itemCount={waitlist.length}
          itemSize={120}
          width="100%"
          overscanCount={5}
          key={listKey}
          useIsScrolling={true} // Add this to optimize rendering during scrolling
        >
          {Row}
        </List>
      </div>
    );
  }, [waitlist, listHeight, Row, isReady, listKey]);

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
          <AnimatePresence mode="wait">{VirtualList}</AnimatePresence>
        </motion.div>
      </div>
    </>
  );
});
