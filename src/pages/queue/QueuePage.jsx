import './queue.scss';
import { memo, useRef, useState } from 'react';
import { Tabs, Swiper } from 'antd-mobile';
import Waitlist from '../../components/Waitlist';
import Bookings from '../../components/Bookings';
import {
  useDoctorsStore,
  useSelectedDoctor,
} from '../../stores/userStore';
import pb from '../../lib/pocketbase';
import { useFullQueue } from '../../stores/queueStore';
import { motion } from 'framer-motion';

// Custom hook
function useQueuePage() {
  const [activeIndex, setActiveIndex] = useState(1);
  const { setSelectedDoctor } = useSelectedDoctor();
  const { updater } = useFullQueue();
  const { doctors } = useDoctorsStore();

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    updater();
  };

  const selectedDoctorId = pb.authStore.model.expand.doctors[0].id;

  return {
    doctors,
    activeIndex,
    setActiveIndex,
    handleDoctorChange,
    selectedDoctorId,
  };
}

// Component
const QueuePage = memo(function QueuePage() {
  const swiperRef = useRef(null);
  const {
    doctors,
    activeIndex,
    setActiveIndex,
    handleDoctorChange,
    selectedDoctorId,
  } = useQueuePage();

  return (
    <>
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
          slideSize={90}
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
