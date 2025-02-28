import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, message, Tag } from 'antd';
import pb from '../lib/pocketbase';
import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import NewPatientModal from './NewPatientModal';
import { useNewPatientModal } from '../stores/patientStore';
import { Dialog } from 'antd-mobile';
import { useFullQueue } from '../stores/queueStore';

const QUEUE_STATUSES = { BOOKING: 'booking', WAITLIST: 'waitlist' };
const PATIENT_TYPES = { NEW: 'new', CONSULTATION: 'consultation' };

// Animation variants for the card - similar to Settings page itemVariants
const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

// Remove the itemVariants since we're not using them anymore
const showErrorMessage = () => {
  message.error({
    content: (
      <div style={{ fontWeight: 'bold', textAlign: 'right' }}>
        <p
          style={{
            fontSize: '1em',
            color: 'red',
            fontWeight: 'bolder',
          }}
        >
          في حاجة غلط - الطلب لم يتم تنفيذه
        </p>
        <p>اتاكد ان من توصيلك للانترنت او اعمل ريفريش</p>
      </div>
    ),
  });
};
const QueueCard = memo(function QueueCard({ data, index }) {
  const { setIsModalOpen } = useNewPatientModal();
  const [loading, setLoading] = useState(false);
  const deleteHandler = useFullQueue((state) => state.deleteHandler);

  const handleDelete = useCallback(async () => {
    try {
      setLoading(true);
      await deleteHandler(data.id);
    } catch (error) {
      showErrorMessage();
    } finally {
      setLoading(false);
    }
  }, [data.id, deleteHandler]);

  const handleStatusChange = useCallback(async () => {
    try {
      setLoading(true);
      const updatedRecord = await pb.collection('queue').update(
        data.id,
        {
          status:
            data.status === QUEUE_STATUSES.WAITLIST
              ? QUEUE_STATUSES.BOOKING
              : QUEUE_STATUSES.WAITLIST,
        },
        { fields: 'none' }
      );

      // Use the updateHandler from useFullQueue to update the local state
      const updateHandler = useFullQueue.getState().updateHandler;
      updateHandler(updatedRecord);
    } catch (error) {
      showErrorMessage();
    } finally {
      setLoading(false);
    }
  }, [data.id, data.status]);
  const showDeleteConfirmation = () => {
    Dialog.show({
      content: (
        <h4 style={{ textAlign: 'center', direction: 'rtl' }}>
          اذا تم حذف المريض فلا يمكن ارجاعه لنفس دوره مرة اخرى.
        </h4>
      ),
      header: (
        <h1
          style={{
            textAlign: 'center',
            direction: 'rtl',
            color: 'red',
          }}
        >
          هل انت متاكد من حذف المريض من الدور ؟
        </h1>
      ),
      closeOnAction: true,
      actions: [
        [
          {
            text: 'نعم',
            key: 'yes',
            bold: true,
            danger: true,
            onClick: async () => {
              await handleDelete();
              Dialog.clear();
            },
          },
          {
            text: 'لا',
            key: 'cancel',
            onClick: () => {
              Dialog.clear();
            },
          },
        ],
      ],
    });
  };
  // Memoize the action button icon function
  const getActionButtonIcon = useCallback(() => {
    if (data.name.length === 0) {
      return data.status === QUEUE_STATUSES.WAITLIST ? (
        <ArrowRightOutlined />
      ) : (
        <ArrowLeftOutlined />
      );
    }
    return <PlusOutlined />;
  }, [data.name.length, data.status]);
  // Memoize the action button click handler
  const handleActionButtonClick = useCallback(
    () =>
      data.name.length > 0
        ? setIsModalOpen(true)
        : handleStatusChange(),
    [data.name.length, setIsModalOpen, handleStatusChange]
  );
  // In the getName function, add memoization
  const getName = useCallback(() => {
    const name =
      data.name?.length > 0 ? data.name : data.expand?.patient?.name;
    if (!name) {
      return 'Unknown Name'; // Default value if name is undefined
    }
    const nameParts = name.split(' ');
    return nameParts.slice(0, 3).join(' ');
  }, [data.name, data.expand?.patient?.name]);
  return (
    <>
      <NewPatientModal data={data} />
      <motion.div
        className={`queue-card-wrapper ${data.status === QUEUE_STATUSES.BOOKING ? '' : 'reverse'}`}
        variants={cardVariants}
        // Remove layoutId, initial, animate, custom, and transition props
        // as they're now controlled by the parent container
        exit={{
          opacity: 0,
          scale: 0.9,
          transition: { duration: 0.2 },
        }}
      >
        <div className="left">
          <h2
            className={
              data.name.length > 0 ? 'card-with-name-only' : ''
            }
          >
            {getName()}
          </h2>
          <p>
            {data.notes.length > 0 ? data.notes : 'لا توجد ملاحظات'}
          </p>
          <div>
            <Tag
              color={
                data.type === PATIENT_TYPES.NEW ? 'green' : 'yellow'
              }
            >
              {data.type === PATIENT_TYPES.NEW
                ? 'كشف جديد'
                : 'استشارة'}
            </Tag>
          </div>
        </div>
        <div className="right">
          <Button
            loading={loading}
            shape="circle"
            danger
            size="middle"
            type="primary"
            icon={<CloseOutlined />}
            onClick={showDeleteConfirmation}
          />
          <Button
            shape="circle"
            size="large"
            loading={loading}
            type="primary"
            onClick={handleActionButtonClick}
            icon={getActionButtonIcon()}
          />
        </div>
      </motion.div>
    </>
  );
});

export default QueueCard;
