import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Tag } from 'antd';
import pb from '../lib/pocketbase';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from 'antd-mobile';

export default function QueueCard({ data }) {
  console.log(data);

  const [loading, setLoading] = useState(false);

  if (data)
    return (
      <>
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
            {/* <Popconfirm
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
            > */}
            <Button
              loading={loading}
              shape="circle"
              danger
              size="middle"
              type="primary"
              // onClick={async () => {
              //   await pb.collection('queue').delete(data.id);
              // }}
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
            {/* </Popconfirm> */}

            <Button
              shape="circle"
              size="large"
              loading={loading}
              type="primary"
              onClick={async () => {
                setLoading(true);

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
      </>
    );
}
