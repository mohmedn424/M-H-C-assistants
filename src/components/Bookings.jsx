import { useBookings } from '../stores/queueStore';
import BookingsCard from './BookingsCard';
import QueueCard from './QueueCard';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export default function Bookings() {
  const [parent] = useAutoAnimate();
  const { bookings } = useBookings();

  return (
    <div className="column">
      <BookingsCard />
      <div className="cards-wrapper" ref={parent}>
        {bookings.map((item) => (
          <QueueCard key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
}
