import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, message, Tag } from 'antd';
import pb from '../lib/pocketbase';
import { memo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NewPatientModal from './NewPatientModal';
import { useNewPatientModal } from '../stores/patientStore';
import { Dialog } from 'antd-mobile';
import { fetchQueueLogic, useFullQueue } from '../stores/queueStore';

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
// Removed memo to ensure component always re-renders
export default function QueueCard({ data, index }) {
  const { setIsModalOpen } = useNewPatientModal();
  const [loading, setLoading] = useState(false);
  const deleteHandler = useFullQueue((state) => state.deleteHandler);
  const updateHandler = useFullQueue((state) => state.updateHandler);
  // Removed forceUpdate as it's no longer needed without memo
  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteHandler(data.id);
    } catch (error) {
      showErrorMessage();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      setLoading(true);
      const newStatus =
        data.status === QUEUE_STATUSES.WAITLIST
          ? QUEUE_STATUSES.BOOKING
          : QUEUE_STATUSES.WAITLIST;

      const updatedRecord = await pb
        .collection('queue')
        .update(data.id, {
          status: newStatus,
        });

      updateHandler(updatedRecord);
    } catch (error) {
      showErrorMessage();
    } finally {
      fetchQueueLogic();
      setLoading(false);
    }
  };

  // Rest of the component remains the same
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

  // Simplify the action button icon function
  const getActionButtonIcon = () => {
    if (data.name.length === 0) {
      return data.status === QUEUE_STATUSES.WAITLIST ? (
        <ArrowRightOutlined />
      ) : (
        <ArrowLeftOutlined />
      );
    }
    return <PlusOutlined />;
  };

  // Simplify the action button click handler
  const handleActionButtonClick = () =>
    data.name.length > 0
      ? setIsModalOpen(true)
      : handleStatusChange();

  // Simplify the getName function
  const getName = () => {
    const name =
      data.name?.length > 0 ? data.name : data.expand?.patient?.name;
    if (!name) {
      return 'Unknown Name'; // Default value if name is undefined
    }
    const nameParts = name.split(' ');
    return nameParts.slice(0, 3).join(' ');
  };

  return (
    <>
      <NewPatientModal data={data} />
      <motion.div
        className={`queue-card-wrapper ${data.status === QUEUE_STATUSES.BOOKING ? '' : 'reverse'}`}
        variants={cardVariants}
        layout
        layoutId={`card-${data.id}`}
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
}
