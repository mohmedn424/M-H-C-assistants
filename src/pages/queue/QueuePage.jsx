import './queue.scss';
import { memo, useRef, useMemo, useCallback } from 'react';
import { Swiper } from 'antd-mobile';

import Waitlist from '../../components/Waitlist';
import Bookings from '../../components/Bookings';

import { motion } from 'framer-motion';
import { ClinicFilterPopup } from './components/ClinicFilterPopup';
import { DoctorFilterPopup } from './components/DoctorFilterPopup';
import QueueHeader from './components/QueueHeader';
import { useQueuePage } from './hooks/useQueuePage';

// Memoize child components that don't need frequent re-renders
const MemoizedWaitlist = memo(Waitlist);
const MemoizedBookings = memo(Bookings);

const QueuePage = memo(function QueuePage() {
  const swiperRef = useRef(null);
  const {
    doctors,
    clinics,
    activeIndex,
    setActiveIndex,
    showFilter,
    setShowFilter,
    clinicValue,
    showDoctorFilter,
    setShowDoctorFilter,
    selectedDoctor,
    handleFilterChange,
    handleDoctorFilterChange,
    handleRefresh,
    clinicName,
    doctorName,
  } = useQueuePage();

  // Memoize header props to prevent unnecessary re-renders
  const headerProps = useMemo(
    () => ({
      doctors,
      doctorName,
      clinicName,
      setShowDoctorFilter,
      setShowFilter,
      handleRefresh,
    }),
    [
      doctors,
      doctorName,
      clinicName,
      setShowDoctorFilter,
      setShowFilter,
      handleRefresh,
    ]
  );

  // Memoize clinic filter props
  const clinicFilterProps = useMemo(
    () => ({
      showFilter,
      setShowFilter,
      clinics,
      clinicValue,
      handleFilterChange,
    }),
    [
      showFilter,
      setShowFilter,
      clinics,
      clinicValue,
      handleFilterChange,
    ]
  );

  // Memoize doctor filter props
  const doctorFilterProps = useMemo(
    () => ({
      showDoctorFilter,
      setShowDoctorFilter,
      doctors,
      selectedDoctor,
      handleDoctorFilterChange,
    }),
    [
      showDoctorFilter,
      setShowDoctorFilter,
      doctors,
      selectedDoctor,
      handleDoctorFilterChange,
    ]
  );

  // Memoize index change handler
  const handleIndexChange = useCallback(
    (index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  return (
    <>
      <QueueHeader {...headerProps} />

      <ClinicFilterPopup {...clinicFilterProps} />

      <DoctorFilterPopup {...doctorFilterProps} />

      <motion.div layoutId="lol" className="queue-page-wrapper">
        <Swiper
          slideSize={90}
          direction="horizontal"
          indicator={() => null}
          ref={swiperRef}
          defaultIndex={activeIndex}
          onIndexChange={handleIndexChange}
        >
          <Swiper.Item>
            <MemoizedWaitlist />
          </Swiper.Item>
          <Swiper.Item>
            <MemoizedBookings />
          </Swiper.Item>
        </Swiper>
      </motion.div>
    </>
  );
});

export default QueuePage;
