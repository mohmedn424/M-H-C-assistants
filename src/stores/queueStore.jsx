import { create } from 'zustand';
import pb from '../lib/pocketbase';
import { useSelectedDoctor, useClinicValue } from './userStore';

export const useWaitlist = create((set) => ({
  waitlist: [],
  setWaitlist: (newVal) => {
    try {
      const sorted = newVal.sort(
        (a, b) => new Date(a.created) - new Date(b.created)
      );
      set({ waitlist: sorted });
    } catch (error) {
      console.error('Failed to update waitlist:', error);
      // Maintain previous state on error
      set((state) => ({ waitlist: state.waitlist }));
    }
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
export const useFullQueue = create((set, get) => ({
  fullQueue: [],
  isLoading: false,
  error: null,

  setFullQueue: async (newval) => {
    try {
      set({ isLoading: true, error: null });
      const selectedDoctor =
        useSelectedDoctor.getState().selectedDoctor;
      const filtered = newval.filter(
        (item) => item?.expand?.doctor?.id === selectedDoctor
      );

      set({
        fullQueue: newval,
        waitlist: filtered.filter(
          (item) => item.status === 'waitlist'
        ),
        bookings: filtered.filter(
          (item) => item.status === 'booking'
        ),
      });

      await get().updater();
    } catch (error) {
      set({ error: error.message });
      console.error('Queue update failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updater: async () => {
    try {
      const { fullQueue } = get();
      const selectedDoctor =
        useSelectedDoctor.getState().selectedDoctor;
      const clinicValue = useClinicValue.getState().clinicValue;

      if (!selectedDoctor) {
        throw new Error('No doctor selected');
      }

      const filtered = fullQueue.filter((item) => {
        const matchesDoctor =
          item?.expand?.doctor?.id === selectedDoctor;
        const matchesClinic =
          !clinicValue.length ||
          item?.expand?.clinic?.id === clinicValue[0];
        return matchesDoctor && matchesClinic;
      });

      await Promise.all([
        useWaitlist
          .getState()
          .setWaitlist(
            filtered.filter((item) => item.status === 'waitlist')
          ),
        useBookings
          .getState()
          .setBookings(
            filtered.filter((item) => item.status === 'booking')
          ),
      ]);
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  },
  deleteHandler: async (id) => {
    try {
      const { fullQueue } = get();
      // Check if the item exists in our local state first
      const itemExists = fullQueue.find((item) => item.id === id);
      if (!itemExists) {
        return; // Skip if already deleted
      }
      // First update local state
      const newQueue = fullQueue.filter((item) => item.id !== id);
      set({ fullQueue: newQueue });
      await get().updater();
      // Then delete from PocketBase
      await pb.collection('queue').delete(id);
    } catch (error) {
      if (error.status !== 404) {
        // Ignore 404 errors
        console.error('Failed to delete queue item:', error);
        throw error;
      }
    }
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
  expand: 'patient,doctor,clinic,assistant',
  fields:
    'id,name,created,status,type,notes,expand.patient.id,expand.patient.name,expand.doctor.id,expand.doctor.name,expand.clinic.id',
};
export const fetchQueueLogic = async () => {
  const { setFullQueue } = useFullQueue.getState();

  try {
    const records = await pb
      .collection('queue')
      .getFullList(queueFetchOptions);
    await setFullQueue(records);
  } catch (error) {
    console.error('Failed to fetch queue:', error);
    throw error;
  }
};
// Remove the immediate execution and let components handle initialization
// pb.authStore.isValid && fetchQueueLogic();
