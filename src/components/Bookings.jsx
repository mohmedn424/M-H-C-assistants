import { memo, useRef, useEffect, useState } from 'react';
import { useBookings } from '../stores/queueStore';
import BookingsCard from './BookingsCard';
import QueueCard from './QueueCard';
import { AnimatePresence, motion } from 'framer-motion';

// Simplified animation variants for better performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      when: 'beforeChildren',
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1 },
  },
};

export default memo(function Bookings() {
  const { bookings } = useBookings();
  const prevBookingsRef = useRef([]);
  const containerRef = useRef(null);
  const [listKey, setListKey] = useState(0); // Add key to force re-render when needed

  // Reset scroll position when bookings change significantly
  useEffect(() => {
    const prevIds = new Set(
      prevBookingsRef.current.map((item) => item.id)
    );
    const currentIds = new Set(bookings.map((item) => item.id));

    // If items were added or removed (not just reordered)
    if (prevIds.size !== currentIds.size) {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      // Force re-render of the list by changing key
      setListKey((prev) => prev + 1);
    }

    prevBookingsRef.current = bookings;
  }, [bookings]);

  return (
    <>
      <BookingsCard />
      <div className="column" ref={containerRef}>
        <motion.div
          className="cards-wrapper"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          key={listKey} // Add key to force re-render when needed
        >
          <AnimatePresence mode="wait">
            {bookings.length === 0 ? (
              <motion.div
                key="empty"
                className="empty-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                لا يوجد حجوزات
              </motion.div>
            ) : (
              bookings.map((item, index) => (
                <QueueCard key={item.id} data={item} index={index} />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
});
