import { useEffect } from 'react';
import { useWaitlist } from '../stores/queueStore';
import QueueCard from './QueueCard';
import WaitListCard from './WaitListCard';
import { AnimatePresence, motion } from 'framer-motion';

export default function Waitlist() {
  const { waitlist } = useWaitlist();

  useEffect(() => {
    const height =
      document.querySelector('.header-card').clientHeight;
    document.querySelector('.column').style.scrollPaddingTop =
      `${height}px`;
  }, [waitlist]);

  return (
    <div className="column">
      <WaitListCard />
      <motion.div layoutId="lol" className="cards-wrapper">
        <AnimatePresence>
          {waitlist.map((item) => (
            <QueueCard key={item.id} data={item} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
