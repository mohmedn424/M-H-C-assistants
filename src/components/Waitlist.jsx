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

export default memo(function Waitlist() {
  const { waitlist } = useWaitlist();

  // Memoize the header height calculation
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

  // Memoize the waitlist items with index for staggered animation
  const waitlistItems = useMemo(() => {
    return waitlist.map((item, index) => (
      <QueueCard key={item.id} data={item} index={index} />
    ));
  }, [waitlist]);

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
          <AnimatePresence mode="popLayout">
            {waitlistItems}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
});
