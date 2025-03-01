import { memo, useRef } from 'react';
import { Swiper } from 'antd-mobile';
import { motion } from 'framer-motion';
import Waitlist from '../../../components/Waitlist';
import Bookings from '../../../components/Bookings';

const QueueContent = memo(function QueueContent({
  activeIndex,
  setActiveIndex,
}) {
  const swiperRef = useRef(null);

  return (
    <motion.div layoutId="lol" className="queue-page-wrapper">
      <Swiper
        slideSize={90}
        direction="horizontal"
        indicator={() => null}
        ref={swiperRef}
        defaultIndex={activeIndex}
        onIndexChange={setActiveIndex}
      >
        <Swiper.Item>
          <Waitlist />
        </Swiper.Item>
        <Swiper.Item>
          <Bookings />
        </Swiper.Item>
      </Swiper>
    </motion.div>
  );
});

export default QueueContent;
