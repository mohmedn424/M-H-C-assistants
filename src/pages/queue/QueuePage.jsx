import './queue.scss';
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Tabs, Swiper, Popup, Radio } from 'antd-mobile';
import { Button } from 'antd';
import { RedoOutline } from 'antd-mobile-icons';
import {
  useClinicsStore,
  useClinicValue,
  useDoctorsStore,
  useSelectedDoctor,
} from '../../stores/userStore';
import Waitlist from '../../components/Waitlist';
import Bookings from '../../components/Bookings';
import pb from '../../lib/pocketbase';
import {
  useFullQueue,
  fetchQueueLogic,
} from '../../stores/queueStore';
import { motion } from 'framer-motion';

// Custom hook with optimized logic
function useQueuePage() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const { clinics } = useClinicsStore();
  const { clinicValue, setClinicValues } = useClinicValue();
  const { setSelectedDoctor } = useSelectedDoctor();
  const { updater } = useFullQueue();
  const { doctors } = useDoctorsStore();

  // Memoize subscription setup to prevent unnecessary re-renders
  const setupSubscription = useCallback(() => {
    fetchQueueLogic();

    // Subscribe to real-time updates
    const subscription = pb
      .collection('queue')
      .subscribe('*', async (data) => {
        if (
          data.action === 'update' ||
          data.action === 'create' ||
          data.action === 'delete'
        ) {
          await fetchQueueLogic();
        }
      });
    return () => {
      pb.collection('queue').unsubscribe();
    };
  }, []);

  // Setup subscription once on mount
  useEffect(() => {
    return setupSubscription();
  }, [setupSubscription]);

  // Update when clinic filter changes
  useEffect(() => {
    updater();
  }, [clinicValue, updater]);

  // Optimize doctor change handler with useCallback
  const handleDoctorChange = useCallback(
    (doctorId) => {
      setSelectedDoctor(doctorId);
      updater();
    },
    [setSelectedDoctor, updater]
  );
  // Memoize filtered doctors
  const filteredDoctors = useMemo(() => {
    // Add null check to prevent error when doctors is undefined
    return (doctors || []).filter(
      (doctor) =>
        !clinicValue.length || doctor.clinic === clinicValue[0]
    );
  }, [doctors, clinicValue]);
  // Get selected doctor ID once
  const selectedDoctorId = useMemo(() => {
    return pb.authStore.model?.expand?.doctors?.[0]?.id || '';
  }, []);

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

  // Memoize clinic name for display
  const clinicName = useMemo(() => {
    if (clinicValue.length > 0) {
      return (
        clinics.find((c) => c.id === clinicValue[0])?.name ||
        'تصفية العيادات'
      );
    }
    return 'تصفية العيادات';
  }, [clinicValue, clinics]);

  // Optimize refresh handler
  const handleRefresh = useCallback(() => {
    fetchQueueLogic();
  }, []);

  // Optimize filter change handler
  const handleFilterChange = useCallback(
    (val) => {
      if (val === 'all') {
        setClinicValues([]);
      } else {
        setClinicValues([val]);
      }
      setShowFilter(false);
    },
    [setClinicValues, setShowFilter]
  );

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
            {clinicName}
          </Button>
          <Button
            shape="circle"
            size="large"
            type="primary"
            danger
            onClick={handleRefresh}
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
            onChange={handleFilterChange}
          >
            {(clinics || []).map((clinic) => (
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
          slideSize={95}
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
