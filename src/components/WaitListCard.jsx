import { PlusOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import {
  useQueueModalState,
  useWaitlist,
} from '../stores/queueStore';
import QueueCount from './QueueCount';
import { useFloatingPanelState } from '../stores/userStore';
import { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

const WaitListCard = memo(function WaitListCard() {
  const { waitlist } = useWaitlist();
  const { setMode } = useQueueModalState();
  const { openFloat } = useFloatingPanelState();

  // Memoize the waitlist count to prevent unnecessary re-renders
  const waitlistCount = useMemo(() => waitlist.length, [waitlist]);

  // Memoize the click handler to prevent recreation on each render
  const handleAddClick = useCallback(() => {
    setMode('waitlist');
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
      layoutId="waitlist-header"
    >
      <div className="left">
        <h2>قائمة الانتظار</h2>
        <p>
          <Tag color="geekblue">{`الاجمالي: ${waitlistCount}`}</Tag>
          <span>
            {waitlistCount > 0 && <QueueCount listMode="waitlist" />}
          </span>
        </p>
      </div>
      <div className="right">
        <Button
          shape="circle"
          size="large"
          type="default"
          icon={<PlusOutlined />}
          className="add-btn"
          onClick={handleAddClick}
          aria-label="Add to waitlist"
        />
      </div>
    </motion.div>
  );
});

export default WaitListCard;
