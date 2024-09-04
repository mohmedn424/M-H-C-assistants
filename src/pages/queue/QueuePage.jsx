import './queue.scss';

import { useRef, useState } from 'react';

import { Tabs, Swiper } from 'antd-mobile';
import Waitlist from '../../components/Waitlist';
import Bookings from '../../components/Bookings';
import {
  useDoctorsStore,
  useSelectedDoctor,
} from '../../stores/userStore';
import pb from '../../lib/pocketbase';
import { useFullQueue, useWaitlist } from '../../stores/queueStore';

export default function QueuePage() {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(1);

  const { setSelectedDoctor } = useSelectedDoctor();
  const { updater } = useFullQueue();

  const { doctors } = useDoctorsStore();

  return (
    <>
      {doctors.length > 1 && (
        <Tabs
          activeLineMode="full"
          className="queue-tabs-wrapper tabs-layout"
          defaultActiveKey={pb.authStore.model.expand.doctors[0].id}
          onChange={(e) => {
            setSelectedDoctor(e);
            updater();
          }}
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
      <div className="queue-page-wrapper">
        <Swiper
          direction="horizontal"
          indicator={() => null}
          ref={swiperRef}
          defaultIndex={activeIndex}
          onIndexChange={(index) => {
            setActiveIndex(index);
          }}
        >
          <Swiper.Item>
            <Waitlist />
          </Swiper.Item>
          <Swiper.Item>
            <Bookings />
          </Swiper.Item>
        </Swiper>
      </div>
    </>
  );
}
