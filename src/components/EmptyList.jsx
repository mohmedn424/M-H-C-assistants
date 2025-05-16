import { memo } from 'react';
import { Empty } from 'antd';
import { motion } from 'framer-motion';

const EmptyList = memo(function EmptyList({
  message = 'لا يوجد بيانات',
}) {
  return (
    <motion.div
      key="empty"
      className="empty-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        margin: '1rem',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span
            style={{
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            {message}
          </span>
        }
      />
    </motion.div>
  );
});

export default EmptyList;
