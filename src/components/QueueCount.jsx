import { useBookings, useWaitlist } from '../stores/queueStore';

import { Tag } from 'antd';

export default function QueueCount({ listMode = 'waitlist' }) {
  const { waitlist } = useWaitlist();
  const { bookings } = useBookings();
  let newCount;
  let followCount;

  if (listMode === 'waitlist') {
    newCount =
      waitlist.length > 0 &&
      `كشف: ${waitlist.filter((item) => item.type === 'new').length}`;
    followCount =
      waitlist.length > 0 &&
      `استشارة: ${waitlist.filter((item) => item.type === 'follow').length}`;
  } else {
    newCount =
      bookings.length > 0 &&
      `كشف: ${bookings.filter((item) => item.type === 'new').length}`;
    followCount =
      bookings.length > 0 &&
      `استشارة: ${bookings.filter((item) => item.type === 'follow').length}`;
  }

  return (
    <>
      <Tag color="green"> {newCount}</Tag>
      <Tag color="yellow"> {followCount} </Tag>
    </>
  );
}
