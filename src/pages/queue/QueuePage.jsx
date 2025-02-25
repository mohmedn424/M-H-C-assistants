import './queue.scss';
import { memo, useEffect, useRef, useState } from 'react';
import { Tabs, Swiper, Popup, Radio } from 'antd-mobile';
import { Button } from 'antd';
import { RedoOutline } from 'antd-mobile-icons';
import {
  useClinicsStore,
  useClinicValue,
} from '../../stores/userStore';
import Waitlist from '../../components/Waitlist';
import Bookings from '../../components/Bookings';
import {
  useDoctorsStore,
  useSelectedDoctor,
} from '../../stores/userStore';
import pb from '../../lib/pocketbase';

import {
  useFullQueue,
  fetchQueueLogic,
} from '../../stores/queueStore';
import { motion } from 'framer-motion';

// Custom hook
function useQueuePage() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const { clinics } = useClinicsStore();
  const { clinicValue, setClinicValues } = useClinicValue();
  const { setSelectedDoctor } = useSelectedDoctor();
  const { updater } = useFullQueue();
  const { doctors } = useDoctorsStore();

  useEffect(() => {
    // Fetch queue data on component mount
    fetchQueueLogic();

    // Set up real-time subscription
    const subscription = pb
      .collection('queue')
      .subscribe('*', async (data) => {
        // Refresh the entire queue on any change
        await fetchQueueLogic();
      });

    return () => {
      // Clean up subscription on unmount
      pb.collection('queue').unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Update filtered lists when clinic selection changes
    updater();
  }, [clinicValue]);

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    updater();
  };

  // Filter doctors based on selected clinic
  const filteredDoctors = doctors.filter(
    (doctor) =>
      !clinicValue.length || doctor.clinic === clinicValue[0]
  );

  const selectedDoctorId = pb.authStore.model.expand.doctors[0].id;

  return {
    doctors: filteredDoctors,
    clinics,
    activeIndex,
    setActiveIndex,
    handleDoctorChange,
    selectedDoctorId,
    showFilter,
    setShowFilter,
    clinicValue,
    setClinicValues,
  };
}

const QueuePage = memo(function QueuePage() {
  const swiperRef = useRef(null);
  const {
    doctors,
    clinics,
    activeIndex,
    setActiveIndex,
    handleDoctorChange,
    selectedDoctorId,
    showFilter,
    setShowFilter,
    clinicValue,
    setClinicValues,
  } = useQueuePage();

  return (
    <>
      <div className="queue-header">
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <Button
            size="large"
            className="filter-button"
            onClick={() => setShowFilter(true)}
          >
            {clinicValue.length > 0
              ? clinics.find((c) => c.id === clinicValue[0])?.name
              : 'تصفية العيادات'}
          </Button>
          <Button
            shape="circle"
            size="large"
            type="primary"
            danger
            onClick={() => {
              fetchQueueLogic();
              // window.location.reload();
            }}
            style={{ padding: '4px 8px' }}
          >
            <RedoOutline />
          </Button>
        </div>
      </div>

      <Popup
        visible={showFilter}
        onMaskClick={() => setShowFilter(false)}
        bodyStyle={{ height: '40vh' }}
      >
        <div className="filter-popup">
          <h3>اختر العيادة</h3>
          <Radio.Group
            value={clinicValue[0] || 'all'}
            onChange={(val) => {
              if (val === 'all') {
                setClinicValues([]);
              } else {
                setClinicValues([val]);
              }
              setShowFilter(false);
            }}
          >
            {clinics.map((clinic) => (
              <Radio
                key={clinic.id}
                value={clinic.id}
                className="clinic-radio"
              >
                {clinic.name}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </Popup>

      {doctors.length > 1 && (
        <Tabs
          activeLineMode="full"
          className="queue-tabs-wrapper tabs-layout"
          defaultActiveKey={selectedDoctorId}
          onChange={handleDoctorChange}
        >
          {doctors.map((item) => (
            <Tabs.Tab
              className="layout-tab"
              key={item.id}
              title={item.name_ar}
            />
          ))}
        </Tabs>
      )}
      <motion.div layoutId="lol" className="queue-page-wrapper">
        <Swiper
          slideSize={50}
          direction="horizontal"
          indicator={() => null}
          ref={swiperRef}
          defaultIndex={activeIndex}
          onIndexChange={setActiveIndex}
        >
          <Swiper.Item>
            <Waitlist />
          </Swiper.Item>
          <Swiper.Item>
            <Bookings />
          </Swiper.Item>
        </Swiper>
      </motion.div>
    </>
  );
});

export default QueuePage;
