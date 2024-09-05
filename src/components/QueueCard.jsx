import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Tag } from 'antd';
import pb from '../lib/pocketbase';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function QueueCard({ data }) {
  const [loading, setLoading] = useState(false);

  if (data)
    return (
      <motion.div
        layoutId={data.id}
        className={
          data.status === 'booking'
            ? 'queue-card-wrapper'
            : 'queue-card-wrapper reverse'
        }
      >
        <div className="left">
          <h2>
            {data.expand.patient.name
              .split(' ')
              .splice(0, 3)
              .join(' ')}
          </h2>
          {
            <p>
              {data.notes.length > 0 ? data.notes : 'لا توجد ملاحظات'}
            </p>
          }

          <Tag color={data.type === 'new' ? 'green' : 'yellow'}>
            {data.type === 'new' ? 'كشف جديد' : 'استشارة'}{' '}
          </Tag>
        </div>
        <div className="right">
          <Popconfirm
            title={
              <span
                style={{
                  textAlign: 'center',
                  fontSize: 18,
                }}
              >
                متاكد من حذف المريض
              </span>
            }
            icon={null}
            placement="left"
            description={
              <span
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                }}
              >
                سوف يتم حذف المريض من الدور
                <br />
                الحذف لا يمكن الرجوع فيه{' '}
              </span>
            }
            onConfirm={async () => {
              setLoading(true);
              await pb.collection('queue').delete(data.id);
              setLoading(false);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button
              loading={loading}
              shape="circle"
              danger
              size="middle"
              type="dashed"
              // onClick={async () => {
              //   await pb.collection('queue').delete(data.id);
              // }}
              icon={<CloseOutlined />}
            />
          </Popconfirm>

          <Button
            shape="circle"
            size="large"
            loading={loading}
            type="primary"
            onClick={async () => {
              setLoading(true);

              const record = await pb
                .collection('queue')
                .update(data.id, {
                  status:
                    data.status === 'waitlist'
                      ? 'booking'
                      : 'waitlist',
                });

              if (record) setLoading(false);
            }}
            icon={
              data.status === 'waitlist' ? (
                <ArrowRightOutlined />
              ) : (
                <ArrowLeftOutlined />
              )
            }
          />
        </div>
      </motion.div>
    );
}
