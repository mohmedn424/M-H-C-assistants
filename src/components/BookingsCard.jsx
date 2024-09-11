import { PlusOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import {
  useBookings,
  useQueueModalState,
} from '../stores/queueStore';
import QueueCount from './QueueCount';
import { useFloatingPanelState } from '../stores/userStore';

export default function BookingCard() {
  const { setMode } = useQueueModalState();
  const { openFloat } = useFloatingPanelState();

  const { bookings } = useBookings();

  return (
    <div className="queue-card-wrapper header-card">
      <div className="left">
        <h2>الحجوزات</h2>
        <p>
          <Tag color="geekblue">
            {`الاجمالي: ${bookings.length}`}{' '}
          </Tag>
          <span>
            {bookings.length > 0 && (
              <QueueCount listMode="bookings" />
            )}
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
          onClick={() => {
            setMode('booking');
            openFloat();
          }}
        />
      </div>
    </div>
  );
}
