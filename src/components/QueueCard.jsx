import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, message, Tag } from 'antd';
import pb from '../lib/pocketbase';
import { memo, useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import NewPatientModal from './NewPatientModal';
import { useNewPatientModal } from '../stores/patientStore';
import { Dialog } from 'antd-mobile';
import { useFullQueue } from '../stores/queueStore';

const QUEUE_STATUSES = { BOOKING: 'booking', WAITLIST: 'waitlist' };
const PATIENT_TYPES = { NEW: 'new', CONSULTATION: 'follow' };

// Animation variants for card items - more subtle transitions
const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      mass: 0.8,
      delay: Math.min(index * 0.03, 0.15), // Cap delay for faster rendering
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.1 }, // Faster exit animation
  },
  update: {
    scale: [1, 1.02, 1],
    backgroundColor: [
      'rgba(255,255,255,0)',
      'rgba(255,255,255,0.2)',
      'rgba(255,255,255,0)',
    ],
    transition: { duration: 0.3 },
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

const QueueCard = memo(function QueueCard({ data, index }) {
  const { setIsModalOpen } = useNewPatientModal();
  const [loading, setLoading] = useState(false);
  const deleteHandler = useFullQueue((state) => state.deleteHandler);
  const updateHandler = useFullQueue((state) => state.updateHandler);
  const operationInProgressRef = useRef(false);

  const handleDelete = useCallback(async () => {
    if (operationInProgressRef.current) return;

    try {
      operationInProgressRef.current = true;
      setLoading(true);

      // Server-first approach - delete from server first
      await pb.collection('queue').delete(data.id);

      // Then update UI after server confirms deletion
      await deleteHandler(data.id);
    } catch (error) {
      showErrorMessage();
    } finally {
      setLoading(false);
      // Add small delay before allowing new operations
      setTimeout(() => {
        operationInProgressRef.current = false;
      }, 300);
    }
  }, [data.id, deleteHandler]);

  const handleStatusChange = useCallback(async () => {
    if (operationInProgressRef.current) return;

    try {
      operationInProgressRef.current = true;
      setLoading(true);

      // Server-first approach - update server first
      const newStatus =
        data.status === QUEUE_STATUSES.WAITLIST
          ? QUEUE_STATUSES.BOOKING
          : QUEUE_STATUSES.WAITLIST;

      // Update the server first
      const updatedServerRecord = await pb.collection('queue').update(
        data.id,
        {
          status: newStatus,
        },
        {
          fields:
            'id,status,name,type,notes,patient,doctor,clinic,created,updated,expand.patient.name,expand.patient.address',
          expand: 'patient',
        }
      );

      // Then update UI with the server response
      updateHandler(updatedServerRecord);
    } catch (error) {
      showErrorMessage();
    } finally {
      setLoading(false);
      // Add small delay before allowing new operations
      setTimeout(() => {
        operationInProgressRef.current = false;
      }, 300);
    }
  }, [data, updateHandler]);

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

  const handleActionButtonClick =
    data.name.length > 0
      ? () => setIsModalOpen(true)
      : handleStatusChange;

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

  const getName = () => {
    console.log(data); // Check if either data.name or data.expand?.patient?.name exists before splitting
    const nameString =
      data.name?.length > 0
        ? data.name
        : data.expand?.patient?.name || '';

    const nameParts = nameString.split(' ');
    return nameParts.slice(0, 3).join(' ');
  };

  // Create a composite key using both id and status
  const compositeKey = `${data.id}-${data.status}`;

  // In the return statement, add animate prop to detect updates
  return (
    <>
      <NewPatientModal data={data} />
      <motion.div
        layoutId={compositeKey}
        className={`queue-card-wrapper ${data.status === QUEUE_STATUSES.BOOKING ? '' : 'reverse'}`}
        variants={cardVariants}
        initial="hidden"
        animate={loading ? 'update' : 'visible'}
        exit="exit"
        custom={index}
        layout
      >
        <div className="left">
          <h2
            className={
              data.name.length > 0 ? 'card-with-name-only' : ''
            }
          >
            {getName()}
          </h2>
          {data?.notes?.length > 0 && <p>{data.notes}</p>}
          <Tag
            color={
              data.type === PATIENT_TYPES.NEW ? 'green' : 'yellow'
            }
          >
            {data.type === PATIENT_TYPES.NEW ? 'كشف جديد' : 'استشارة'}
          </Tag>
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
