import { create } from 'zustand';
import pb from '../lib/pocketbase';
import { useSelectedDoctor } from './userStore';

export const useWaitlist = create((set) => ({
  waitlist: [],
  setWaitlist: (newVal) => {
    const sorted = newVal.sort(
      (a, b) => new Date(a.created) - new Date(b.created)
    );

    set({
      waitlist: sorted,
    });
  },
}));
export const useBookings = create((set) => ({
  bookings: [],
  setBookings: (newVal) => {
    const sorted = newVal.sort(
      (a, b) => new Date(a.created) - new Date(b.created)
    );

    set({
      bookings: sorted,
    });
  },
}));

export const useQueueModalState = create((set) => ({
  mode: '',

  setMode: (newval) => {
    set({ mode: newval });
  },
}));
export const useFullQueue = create((set) => ({
  fullQueue: [],
  setFullQueue: (newval) => {
    const updater = useFullQueue.getState().updater;

    set({ fullQueue: newval });
    updater();
  },

  updater: () => {
    const setWaitlist = useWaitlist.getState().setWaitlist;
    const setBookings = useBookings.getState().setBookings;
    const fullQueue = useFullQueue.getState().fullQueue;
    const selectedDoctor =
      useSelectedDoctor.getState().selectedDoctor;

    const filtered = fullQueue.filter(
      (item) => item.expand.doctor.id === selectedDoctor
    );

    const waitlist = filtered.filter(
      (item) => item.status === 'waitlist'
    );
    setWaitlist(waitlist);
    const bookings = filtered.filter(
      (item) => item.status === 'booking'
    );
    setBookings(bookings);
  },

  deleteHandler: (id) => {
    const updater = useFullQueue.getState().updater;
    const fullQueue = useFullQueue.getState().fullQueue;
    const setFullQueue = useFullQueue.getState().setFullQueue;

    if (fullQueue.length === 1) setFullQueue([]);

    const newQueue = fullQueue.filter((item) => item.id != id);
    setFullQueue(newQueue);
    updater();
  },

  createHandler: (record) => {
    const updater = useFullQueue.getState().updater;
    const fullQueue = useFullQueue.getState().fullQueue;
    const setFullQueue = useFullQueue.getState().setFullQueue;

    setFullQueue([...fullQueue, record]);
    updater();
  },

  updateHandler: (record) => {
    const updater = useFullQueue.getState().updater;
    const fullQueue = useFullQueue.getState().fullQueue;
    const setFullQueue = useFullQueue.getState().setFullQueue;

    const updatedQueue = fullQueue.map((item) => {
      if (item.id === record.id) return record;
      return item;
    });
    setFullQueue(updatedQueue);
    updater();
  },
}));

export const queueFetchOptions = {
  sort: '-created',
  expand: 'patient,doctor,doctor,clinic,assistant',
  fields:
    'id,name,created,status,type,notes,expand.patient.id,expand.patient.name,expand.doctor.id,expand.doctor.name',
};
export const fetchQueueLogic = async () => {
  const setFullQueue = useFullQueue.getState().setFullQueue;

  const records = await pb
    .collection('queue')
    .getFullList(queueFetchOptions);

  if (records) setFullQueue(records);
};

pb.authStore.isValid && fetchQueueLogic();
