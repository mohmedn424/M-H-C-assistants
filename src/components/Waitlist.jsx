import {
  memo,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useWaitlist } from '../stores/queueStore';
import QueueCard from './QueueCard';
import WaitListCard from './WaitListCard';
import { AnimatePresence, motion } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { useWindowSize } from '../hooks/useWindowSize';

// Simplified animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default memo(function Waitlist() {
  const { waitlist } = useWaitlist();
  const windowSize = useWindowSize();
  const [listHeight, setListHeight] = useState(
    window.innerHeight - 200
  );
  const [isReady, setIsReady] = useState(false);

  // Memoize the header height calculation
  const updateScrollPadding = useCallback(() => {
    const height =
      document.querySelector('.header-card')?.clientHeight || 0;

    document.querySelector('.column').style.scrollPaddingTop =
      `${height}px`;

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

  // Row renderer for virtualized list
  const Row = useCallback(
    ({ index, style }) => {
      const item = waitlist[index];
      return (
        <div style={{ ...style, height: 'auto' }}>
          <QueueCard key={item.id} data={item} index={index} />
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
          height={listHeight}
          itemCount={waitlist.length}
          itemSize={120}
          width="100%"
          overscanCount={5}
        >
          {Row}
        </List>
      </div>
    );
  }, [waitlist, listHeight, Row, isReady]);

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
          <AnimatePresence>
            {waitlist.map((item, index) => (
              <QueueCard key={item.id} data={item} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
});
