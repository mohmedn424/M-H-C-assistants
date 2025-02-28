import { create } from 'zustand';
import pb from '../lib/pocketbase';
import { useSelectedDoctor, useClinicValue } from './userStore';

// Constants for better maintainability
const QUEUE_STATUS = {
  WAITLIST: 'waitlist',
  BOOKING: 'booking',
};

// Helper function for sorting by creation date
const sortByCreationDate = (a, b) =>
  new Date(a.created) - new Date(b.created);

// Waitlist store with error handling
export const useWaitlist = create((set) => ({
  waitlist: [],
  setWaitlist: (newVal) => {
    try {
      const sorted = [...newVal].sort(sortByCreationDate);
      set({ waitlist: sorted });
    } catch (error) {
      console.error('Failed to update waitlist:', error);
      // Maintain previous state on error
      set((state) => ({ waitlist: state.waitlist }));
    }
  },
}));

// Bookings store with consistent error handling
export const useBookings = create((set) => ({
  bookings: [],
  setBookings: (newVal) => {
    try {
      const sorted = [...newVal].sort(sortByCreationDate);
      set({ bookings: sorted });
    } catch (error) {
      console.error('Failed to update bookings:', error);
      // Maintain previous state on error
      set((state) => ({ bookings: state.bookings }));
    }
  },
}));

// Modal state store
export const useQueueModalState = create((set) => ({
  mode: '',
  setMode: (newval) => set({ mode: newval }),
}));

// Main queue store with optimized methods
export const useFullQueue = create((set, get) => ({
  fullQueue: [],
  isLoading: false,
  error: null,

  // Set the full queue and filter by selected doctor
  setFullQueue: async (newval) => {
    try {
      set({ isLoading: true, error: null });
      const selectedDoctor =
        useSelectedDoctor.getState().selectedDoctor;

      // Store the full queue
      set({ fullQueue: newval });

      // Update filtered lists
      await get().updater();
    } catch (error) {
      set({ error: error.message || 'Unknown error' });
      console.error('Queue update failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Optimized updater function with early returns and single-pass filtering
  updater: async () => {
    try {
      const { fullQueue } = get();
      const selectedDoctor =
        useSelectedDoctor.getState().selectedDoctor;
      const clinicValue = useClinicValue.getState().clinicValue;

      // Early return if no data to process
      if (!selectedDoctor || !fullQueue.length) {
        return;
      }

      // Process data in a single pass
      const waitlistItems = [];
      const bookingItems = [];

      fullQueue.forEach((item) => {
        const matchesDoctor =
          item?.expand?.doctor?.id === selectedDoctor;
        const matchesClinic =
          !clinicValue.length ||
          item?.expand?.clinic?.id === clinicValue[0];

        if (matchesDoctor && matchesClinic) {
          if (item.status === QUEUE_STATUS.WAITLIST) {
            waitlistItems.push(item);
          } else if (item.status === QUEUE_STATUS.BOOKING) {
            bookingItems.push(item);
          }
        }
      });

      // Update both states at once for better performance
      await Promise.all([
        useWaitlist.getState().setWaitlist(waitlistItems),
        useBookings.getState().setBookings(bookingItems),
      ]);
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  },

  // Delete handler with optimistic updates
  deleteHandler: async (id) => {
    try {
      const { fullQueue } = get();

      // Check if the item exists in our local state first
      const itemExists = fullQueue.find((item) => item.id === id);
      if (!itemExists) {
        return; // Skip if already deleted
      }

      // Optimistic update - update local state first
      const newQueue = fullQueue.filter((item) => item.id !== id);
      set({ fullQueue: newQueue });

      // Update filtered lists
      await get().updater();

      // Then delete from PocketBase
      await pb.collection('queue').delete(id);
    } catch (error) {
      // Only log non-404 errors
      if (error.status !== 404) {
        console.error('Failed to delete queue item:', error);
        throw error;
      }
    }
  },

  // Create handler with optimistic updates
  createHandler: (record) => {
    const { fullQueue, updater } = get();

    // Update local state
    set({ fullQueue: [...fullQueue, record] });

    // Update filtered lists
    updater();
  },

  // Update handler with optimistic updates
  updateHandler: (record) => {
    const { fullQueue, updater } = get();

    // Update local state
    const updatedQueue = fullQueue.map((item) =>
      item.id === record.id ? record : item
    );

    set({ fullQueue: updatedQueue });

    // Update filtered lists
    updater();
  },
}));

// Queue fetch options
export const queueFetchOptions = {
  sort: '-created',
  expand: 'patient,doctor,clinic,assistant',
  fields:
    'id,name,created,status,type,notes,expand.patient.id,expand.patient.name,expand.doctor.id,expand.doctor.name,expand.clinic.id',
};

// Fetch queue logic
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
