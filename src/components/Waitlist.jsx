import { useEffect } from 'react';
import { useWaitlist } from '../stores/queueStore';
import QueueCard from './QueueCard';
import WaitListCard from './WaitListCard';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export default function Waitlist() {
  const { waitlist } = useWaitlist();
  const [parent] = useAutoAnimate();

  useEffect(() => {
    const height =
      document.querySelector('.header-card').clientHeight;
    document.querySelector('.column').style.scrollPaddingTop =
      `${height}px`;
  }, [waitlist]);

  return (
    <div className="column">
      <WaitListCard />
      <div className="cards-wrapper" ref={parent}>
        {waitlist.map((item) => (
          <QueueCard key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
}
