import { PlusOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import {
  useBookings,
  useQueueModalState,
} from '../stores/queueStore';
import QueueCount from './QueueCount';
import { useFloatingPanelState } from '../stores/userStore';
import { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

const BookingCard = memo(function BookingCard() {
  const { setMode } = useQueueModalState();
  const { openFloat } = useFloatingPanelState();
  const { bookings } = useBookings();

  // Memoize the booking count to prevent unnecessary re-renders
  const bookingsCount = useMemo(() => bookings.length, [bookings]);

  // Memoize the click handler to prevent recreation on each render
  const handleAddClick = useCallback(() => {
    setMode('booking');
    openFloat();
  }, [setMode, openFloat]);

  // Animation variants for smoother transitions
  const cardVariants = {
    initial: { opacity: 0.8, y: -5 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="queue-card-wrapper header-card"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      layoutId="bookings-header"
    >
      <div className="left">
        <h2>الحجوزات</h2>
        <p>
          <Tag color="geekblue">{`الاجمالي: ${bookingsCount}`} </Tag>
          <span>
            {bookingsCount > 0 && <QueueCount listMode="bookings" />}
          </span>
        </p>
      </div>
      <div className="right">
        <Button
          shape="circle"
          size="large"
          type="default"
          className="add-btn"
          icon={<PlusOutlined />}
          onClick={handleAddClick}
          aria-label="Add booking"
        />
      </div>
    </motion.div>
  );
});

export default BookingCard;
