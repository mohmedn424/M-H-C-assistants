import {
  memo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useBookings } from '../stores/queueStore';
import BookingsCard from './BookingsCard';
import QueueCard from './QueueCard';
import { AnimatePresence, motion } from 'framer-motion';
import EmptyList from './EmptyList';

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

    // Check if items were added or removed (not just updated)
    const itemsAdded = bookings.some((item) => !prevIds.has(item.id));
    const itemsRemoved = prevBookingsRef.current.some(
      (item) => !currentIds.has(item.id)
    );

    // If items were added or removed (not just updated)
    if (itemsAdded || itemsRemoved) {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      // Force re-render of the list by changing key
      setListKey((prev) => prev + 1);
    }

    prevBookingsRef.current = bookings;
  }, [bookings]);

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
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll, {
        passive: true,
      });
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener(
          'scroll',
          handleScroll
        );
      }
    };
  }, [handleScroll]);

  // Add haptic feedback when bookings change
  useEffect(() => {
    const prevIds = new Set(
      prevBookingsRef.current.map((item) => item.id)
    );
    const currentIds = new Set(bookings.map((item) => item.id));

    // Check if items were added or removed (not just updated)
    const itemsAdded = bookings.some((item) => !prevIds.has(item.id));
    const itemsRemoved = prevBookingsRef.current.some(
      (item) => !currentIds.has(item.id)
    );

    // If items were added or removed, provide haptic feedback
    if ((itemsAdded || itemsRemoved) && navigator.vibrate) {
      navigator.vibrate(itemsAdded ? 40 : 60); // Different feedback for add vs remove
    }
  }, [bookings]);

  return (
    <>
      <BookingsCard />
      <div
        className="column"
        ref={containerRef}
        onTouchStart={() => {
          // Optional subtle feedback on touch
          if (navigator.vibrate) {
            navigator.vibrate(10); // Very subtle vibration
          }
        }}
      >
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
              <EmptyList message="لا يوجد حجوزات" />
            ) : (
              bookings.map((item, index) => {
                // Create composite key using both id and status
                const compositeKey = `${item.id}-${item.status}`;
                return (
                  <QueueCard
                    key={compositeKey}
                    data={item}
                    index={index}
                  />
                );
              })
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
});
