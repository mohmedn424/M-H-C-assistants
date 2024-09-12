import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Tag } from 'antd';
import pb from '../lib/pocketbase';
import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from 'antd-mobile';
import NewPatientModal from './NewPatientModal';
import { useNewPatientModal } from '../stores/patientStore';

export default memo(function QueueCard({ data }) {
  const [loading, setLoading] = useState(false);

  const { setIsModalOpen } = useNewPatientModal();

  if (data)
    return (
      <>
        <NewPatientModal data={data} />
        <motion.div
          layoutId={data.id}
          className={
            data.status === 'booking'
              ? 'queue-card-wrapper'
              : 'queue-card-wrapper reverse'
          }
        >
          <div className="left">
            <h2
              className={
                data.name.length > 0 ? 'card-with-name-only' : ''
              }
            >
              {data.name.length > 0
                ? data.name.split(' ').splice(0, 3).join(' ')
                : data.expand?.patient?.name
                    .split(' ')
                    .splice(0, 3)
                    .join(' ')}
            </h2>
            {
              <p>
                {data.notes.length > 0
                  ? data.notes
                  : 'لا توجد ملاحظات'}
              </p>
            }

            <Tag color={data.type === 'new' ? 'green' : 'yellow'}>
              {data.type === 'new' ? 'كشف جديد' : 'استشارة'}{' '}
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
              onClick={() =>
                Dialog.show({
                  content: (
                    <h4
                      style={{
                        textAlign: 'center',
                        direction: 'rtl',
                      }}
                    >
                      اذا تم حذف المريض فلا يمكن ارجاعه لنفس دوره مرة
                      اخرى.
                    </h4>
                  ),
                  destroyOnClose: true,
                  disableBodyScroll: true,
                  closeOnMaskClick: true,
                  closeOnAction: true,
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
                  actions: [
                    [
                      {
                        text: 'نعم',
                        key: 'yes',
                        bold: true,
                        danger: true,
                        onClick: async () => {
                          setLoading(true);
                          await pb
                            .collection('queue')
                            .delete(data.id);
                          setLoading(false);
                        },
                      },
                      { text: 'لا', key: 'cancel' },
                    ],
                  ],
                })
              }
            />

            {
              <Button
                shape="circle"
                size="large"
                loading={loading}
                type="primary"
                onClick={async () => {
                  if (data.name.length > 0) {
                    setIsModalOpen(true);
                    return;
                  }

                  const record = await pb.collection('queue').update(
                    data.id,
                    {
                      status:
                        data.status === 'waitlist'
                          ? 'booking'
                          : 'waitlist',
                    },
                    {
                      fields: 'id,name,status,patient',
                    }
                  );
                }}
                icon={
                  data.name.length == 0 ? (
                    data.status === 'waitlist' ? (
                      <ArrowRightOutlined />
                    ) : (
                      <ArrowLeftOutlined />
                    )
                  ) : (
                    <PlusOutlined />
                  )
                }
              />
            }
          </div>
        </motion.div>
      </>
    );
});
