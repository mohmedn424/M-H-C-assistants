import { create } from 'zustand';
import pb from '../lib/pocketbase';
import { useSelectedDoctor, useClinicValue } from './userStore';

// Constants for better maintainability
const QUEUE_STATUS = {
  WAITLIST: 'waitlist',
  BOOKING: 'booking',
};

// Optimized sorting function with memoization
const createDateCache = new Map();
const sortByCreationDate = (a, b) => {
  // Use cached date values if available
  if (!createDateCache.has(a.id)) {
    createDateCache.set(a.id, new Date(a.created).getTime());
  }
  if (!createDateCache.has(b.id)) {
    createDateCache.set(b.id, new Date(b.created).getTime());
  }
  return createDateCache.get(a.id) - createDateCache.get(b.id);
};

// Clear cache when it gets too large (prevent memory leaks)
const clearCacheIfNeeded = () => {
  if (createDateCache.size > 1000) {
    createDateCache.clear();
  }
};

// Waitlist store with error handling
export const useWaitlist = create((set) => ({
  waitlist: [],
  setWaitlist: (newVal) => {
    try {
      // Skip sorting for single item arrays
      if (newVal.length <= 1) {
        set({ waitlist: newVal });
        return;
      }

      // Use slice for better performance than spread
      const sorted = newVal.slice().sort(sortByCreationDate);
      set({ waitlist: sorted });
      clearCacheIfNeeded();
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
      // Skip sorting for single item arrays
      if (newVal.length <= 1) {
        set({ bookings: newVal });
        return;
      }

      // Use slice for better performance than spread
      const sorted = newVal.slice().sort(sortByCreationDate);
      set({ bookings: sorted });
      clearCacheIfNeeded();
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

// Debounce helper to prevent rapid consecutive updates
let updateTimer = null;
const debounceUpdate = (fn, delay = 50) => {
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(fn, delay);
};

// Main queue store with optimized methods
export const useFullQueue = create((set, get) => ({
  fullQueue: [],
  isLoading: false,
  error: null,
  lastUpdateId: '', // Track last updated record ID

  // Set the full queue and filter by selected doctor
  setFullQueue: async (newval) => {
    try {
      // Skip update if data is identical (length and first/last items)
      const currentQueue = get().fullQueue;
      if (
        currentQueue.length === newval.length &&
        currentQueue.length > 0 &&
        currentQueue[0].id === newval[0].id &&
        currentQueue[currentQueue.length - 1].id ===
          newval[newval.length - 1].id
      ) {
        return;
      }

      set({ isLoading: true, error: null });

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
      if (!fullQueue.length) {
        // Clear both lists when there's no data
        useWaitlist.getState().setWaitlist([]);
        useBookings.getState().setBookings([]);
        return;
      }

      // Pre-allocate arrays with estimated capacity
      const waitlistItems = [];
      const bookingItems = [];

      // Optimize filtering with pre-checks
      const hasClinicFilter = clinicValue.length > 0;
      const clinicId = hasClinicFilter ? clinicValue[0] : null;

      // Process data in a single optimized pass
      for (let i = 0; i < fullQueue.length; i++) {
        const item = fullQueue[i];

        // Skip items without doctor data
        if (!item?.expand?.doctor) continue;

        const matchesDoctor =
          !selectedDoctor || item.expand.doctor.id === selectedDoctor;
        const matchesClinic =
          !hasClinicFilter || item?.expand?.clinic?.id === clinicId;

        if (matchesDoctor && matchesClinic) {
          if (item.status === QUEUE_STATUS.WAITLIST) {
            waitlistItems.push(item);
          } else if (item.status === QUEUE_STATUS.BOOKING) {
            bookingItems.push(item);
          }
        }
      }

      // Update both states concurrently for better performance
      await Promise.all([
        useWaitlist.getState().setWaitlist(waitlistItems),
        useBookings.getState().setBookings(bookingItems),
      ]);
    } catch (error) {
      console.error('Update failed:', error);
    }
  },

  // Delete handler with optimistic updates
  deleteHandler: async (id) => {
    try {
      const { fullQueue } = get();

      // Find item index for more efficient removal
      const itemIndex = fullQueue.findIndex((item) => item.id === id);
      if (itemIndex === -1) {
        return; // Skip if already deleted
      }

      // Optimistic update - update local state first
      const newQueue = fullQueue.slice();
      newQueue.splice(itemIndex, 1); // More efficient than filter
      set({ fullQueue: newQueue, lastUpdateId: id });

      // Update filtered lists
      get().updater();

      // Then delete from PocketBase
      await pb.collection('queue').delete(id);
    } catch (error) {
      // Only log non-404 errors
      if (error.status !== 404) {
        console.error('Failed to delete queue item:', error);
      }
    }
  },

  // Create handler with optimistic updates
  createHandler: (record) => {
    const { fullQueue } = get();

    // Skip if record already exists
    if (fullQueue.some((item) => item.id === record.id)) {
      return;
    }

    // Update local state
    set({
      fullQueue: [...fullQueue, record],
      lastUpdateId: record.id,
    });

    // Update filtered lists immediately
    get().updater();
  },

  // Update handler with optimistic updates - MODIFIED FOR IMMEDIATE UPDATES
  updateHandler: (record) => {
    const { fullQueue, lastUpdateId } = get();

    // Skip duplicate rapid updates to the same record
    if (lastUpdateId === record.id) {
      debounceUpdate(() => {
        get().updateHandler(record);
      }, 100);
      return;
    }

    const selectedDoctor =
      useSelectedDoctor.getState().selectedDoctor;
    const clinicValue = useClinicValue.getState().clinicValue;

    // Find item index for more efficient updates
    const itemIndex = fullQueue.findIndex(
      (item) => item.id === record.id
    );

    // Update local state efficiently
    let updatedQueue;
    if (itemIndex !== -1) {
      updatedQueue = fullQueue.slice();
      updatedQueue[itemIndex] = record;
    } else {
      updatedQueue = [...fullQueue, record];
    }

    set({ fullQueue: updatedQueue, lastUpdateId: record.id });

    // Optimize filtering with pre-checks
    const hasClinicFilter = clinicValue.length > 0;
    const clinicId = hasClinicFilter ? clinicValue[0] : null;

    // Check if record matches current filters
    const matchesDoctor =
      !selectedDoctor ||
      record?.expand?.doctor?.id === selectedDoctor;
    const matchesClinic =
      !hasClinicFilter || record?.expand?.clinic?.id === clinicId;

    if (matchesDoctor && matchesClinic) {
      // Direct update to the appropriate list for immediate UI feedback
      if (record.status === QUEUE_STATUS.WAITLIST) {
        const waitlistState = useWaitlist.getState();
        const currentWaitlist = waitlistState.waitlist;
        const existingIndex = currentWaitlist.findIndex(
          (item) => item.id === record.id
        );

        if (existingIndex >= 0) {
          // Update existing item efficiently
          const newWaitlist = currentWaitlist.slice();
          newWaitlist[existingIndex] = record;
          waitlistState.setWaitlist(newWaitlist);
        } else {
          // Add to waitlist and remove from bookings if present
          waitlistState.setWaitlist([...currentWaitlist, record]);

          const bookingsState = useBookings.getState();
          const currentBookings = bookingsState.bookings;
          const bookingIndex = currentBookings.findIndex(
            (item) => item.id === record.id
          );

          if (bookingIndex >= 0) {
            const newBookings = currentBookings.slice();
            newBookings.splice(bookingIndex, 1);
            bookingsState.setBookings(newBookings);
          }
        }
      } else if (record.status === QUEUE_STATUS.BOOKING) {
        const bookingsState = useBookings.getState();
        const currentBookings = bookingsState.bookings;
        const existingIndex = currentBookings.findIndex(
          (item) => item.id === record.id
        );

        if (existingIndex >= 0) {
          // Update existing item efficiently
          const newBookings = currentBookings.slice();
          newBookings[existingIndex] = record;
          bookingsState.setBookings(newBookings);
        } else {
          // Add to bookings and remove from waitlist if present
          bookingsState.setBookings([...currentBookings, record]);

          const waitlistState = useWaitlist.getState();
          const currentWaitlist = waitlistState.waitlist;
          const waitlistIndex = currentWaitlist.findIndex(
            (item) => item.id === record.id
          );

          if (waitlistIndex >= 0) {
            const newWaitlist = currentWaitlist.slice();
            newWaitlist.splice(waitlistIndex, 1);
            waitlistState.setWaitlist(newWaitlist);
          }
        }
      }
    }

    // Run the updater to ensure consistency
    get().updater();
  },
}));

// Queue fetch options - use a frozen object to prevent recreation
export const queueFetchOptions = Object.freeze({
  sort: '-created',
  expand: 'patient,doctor,clinic,assistant',
  fields:
    'id,name,created,status,type,notes,expand.patient.id,expand.patient.name,expand.doctor.id,expand.doctor.name,expand.clinic.id',
});

// Prevent multiple simultaneous fetches
let fetchInProgress = false;

// Fetch queue logic
export const fetchQueueLogic = async () => {
  // Prevent multiple simultaneous fetches
  if (fetchInProgress) return;

  fetchInProgress = true;

  try {
    const { setFullQueue } = useFullQueue.getState();
    const records = await pb
      .collection('queue')
      .getFullList(queueFetchOptions);
    await setFullQueue(records);
  } catch (error) {
    console.error('Failed to fetch queue:', error);
  } finally {
    fetchInProgress = false;
  }
};
