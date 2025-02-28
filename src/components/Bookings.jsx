import { memo } from 'react';
import { useBookings } from '../stores/queueStore';
import BookingsCard from './BookingsCard';
import QueueCard from './QueueCard';
import { AnimatePresence, motion } from 'framer-motion';

// Enhanced animation variants with staggering
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      when: 'beforeChildren',
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

export default memo(function Bookings() {
  const { bookings } = useBookings();

  return (
    <>
      <BookingsCard />
      <div className="column">
        <motion.div
          className="cards-wrapper"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          <AnimatePresence>
            {bookings.map((item, index) => (
              <QueueCard key={item.id} data={item} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
});
