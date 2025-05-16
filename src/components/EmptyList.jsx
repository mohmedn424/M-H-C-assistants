import { memo } from 'react';
import { motion } from 'framer-motion';

// Animation variants with smoother transitions - matching QueueCard animations
const emptyVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

const EmptyList = memo(function EmptyList({
  message = 'لا يوجد بيانات',
}) {
  return (
    <motion.div
      key="empty"
      className="queue-card-wrapper"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={emptyVariants}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        margin: '0 1em',
        borderRadius: '16px',
        direction: 'rtl',
        userSelect: 'none',
        minHeight: '80px', // Match minimum height of patient cards
        padding: '20px', // Match padding of queue-card-wrapper
      }}
    >
      <div className="left" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5em', margin: 0 }}>{message}</h2>
      </div>
    </motion.div>
  );
});

export default EmptyList;
