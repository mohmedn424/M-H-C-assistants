import { memo, useEffect, useCallback, useMemo } from 'react';
import { useWaitlist } from '../stores/queueStore';
import QueueCard from './QueueCard';
import WaitListCard from './WaitListCard';
import { AnimatePresence, motion } from 'framer-motion';

// Animation variants similar to Settings page
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Removed memo to ensure component always re-renders with new data
export default function Waitlist() {
  const { waitlist } = useWaitlist();

  // Header height calculation
  const updateScrollPadding = useCallback(() => {
    const height =
      document.querySelector('.header-card')?.clientHeight;
    if (height) {
      document.querySelector('.column').style.scrollPaddingTop =
        `${height}px`;
    }
  }, []);

  useEffect(() => {
    updateScrollPadding();
  }, [waitlist, updateScrollPadding]);

  // Removed useMemo to ensure items always re-render with fresh data
  const waitlistItems = waitlist.map((item, index) => (
    <QueueCard key={item.id} data={item} index={index} />
  ));

  return (
    <>
      <WaitListCard />
      <div className="column">
        <motion.div
          className="cards-wrapper"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <AnimatePresence mode="sync">
            {waitlistItems}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
