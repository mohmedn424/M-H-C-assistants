import { useBookings } from '../stores/queueStore';
import BookingsCard from './BookingsCard';
import QueueCard from './QueueCard';
import { AnimatePresence, motion } from 'framer-motion';

export default function Bookings() {
  const { bookings } = useBookings();

  return (
    <div className="column">
      <BookingsCard />
      <motion.div layoutId="lol" className="cards-wrapper">
        <AnimatePresence>
          {bookings.map((item) => (
            <QueueCard key={item.id} data={item} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
