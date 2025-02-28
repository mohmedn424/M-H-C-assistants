import { useBookings, useWaitlist } from '../stores/queueStore';
import { Tag } from 'antd';
import { memo, useMemo } from 'react';

// Constants for better maintainability
const PATIENT_TYPES = {
  NEW: 'new',
  FOLLOW: 'follow',
};

const QueueCount = memo(function QueueCount({
  listMode = 'waitlist',
}) {
  const { waitlist } = useWaitlist();
  const { bookings } = useBookings();

  // Use the appropriate list based on the listMode prop
  const currentList = useMemo(
    () => (listMode === 'waitlist' ? waitlist : bookings),
    [listMode, waitlist, bookings]
  );

  // Calculate counts only when the list changes
  const { newCount, followCount } = useMemo(() => {
    if (!currentList.length) {
      return { newCount: null, followCount: null };
    }

    // Count in a single pass through the array for better performance
    const counts = currentList.reduce(
      (acc, item) => {
        if (item.type === PATIENT_TYPES.NEW) {
          acc.new++;
        } else if (item.type === PATIENT_TYPES.FOLLOW) {
          acc.follow++;
        }
        return acc;
      },
      { new: 0, follow: 0 }
    );

    return {
      newCount: `كشف: ${counts.new}`,
      followCount: `استشارة: ${counts.follow}`,
    };
  }, [currentList]);

  // Only render tags if we have data
  if (!currentList.length) {
    return null;
  }

  return (
    <>
      <Tag color="green">{newCount}</Tag>
      <Tag color="yellow">{followCount}</Tag>
    </>
  );
});

export default QueueCount;
