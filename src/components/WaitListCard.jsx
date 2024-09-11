import { PlusOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import {
  useQueueModalState,
  useWaitlist,
} from '../stores/queueStore';
import QueueCount from './QueueCount';
import { useFloatingPanelState } from '../stores/userStore';

export default function QueueCard() {
  const { waitlist } = useWaitlist();
  const { setMode } = useQueueModalState();
  const { openFloat } = useFloatingPanelState();

  return (
    <div className="queue-card-wrapper header-card">
      <div className="left">
        <h2>قائمة الانتظار</h2>
        <p>
          <Tag color="geekblue">{`الاجمالي: ${waitlist.length}`}</Tag>
          <span>
            {waitlist.length > 0 && (
              <QueueCount listMode="waitlist" />
            )}
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
          onClick={() => {
            setMode('waitlist');
            openFloat();
          }}
        />
      </div>
    </div>
  );
}
