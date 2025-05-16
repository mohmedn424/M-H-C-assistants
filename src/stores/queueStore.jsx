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

  // Delete handler with server-first approach
  deleteHandler: async (id) => {
    try {
      const { fullQueue } = get();

      // Find item index
      const itemIndex = fullQueue.findIndex((item) => item.id === id);
      if (itemIndex === -1) {
        return; // Skip if already deleted
      }

      // Server operation already completed in QueueCard component
      // Just update the local state now
      const newQueue = fullQueue.slice();
      newQueue.splice(itemIndex, 1); // More efficient than filter
      set({ fullQueue: newQueue, lastUpdateId: id });

      // Update filtered lists
      get().updater();
    } catch (error) {
      console.error('Delete failed:', error);
      throw error; // Propagate error to caller
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

  // Update handler with improved state management
  // Optimized update handler with individual item updates
  updateHandler: async (updatedRecord) => {
    try {
      const { fullQueue } = get();

      // Find the item in the queue
      const itemIndex = fullQueue.findIndex(
        (item) => item.id === updatedRecord.id
      );
      if (itemIndex === -1) return; // Item not found

      // Create a new array with the updated item
      const newQueue = [...fullQueue];

      // Store previous status for comparison
      const previousStatus = fullQueue[itemIndex].status;
      const newStatus = updatedRecord.status;

      // Update the item in place
      newQueue[itemIndex] = updatedRecord;

      // Set the full queue with the updated item
      set({ fullQueue: newQueue, lastUpdateId: updatedRecord.id });

      // If status changed, handle the move between lists
      if (previousStatus !== newStatus) {
        // Get current lists
        const currentWaitlist = useWaitlist.getState().waitlist;
        const currentBookings = useBookings.getState().bookings;

        // Handle status change from waitlist to booking
        if (
          previousStatus === QUEUE_STATUS.WAITLIST &&
          newStatus === QUEUE_STATUS.BOOKING
        ) {
          // Remove from waitlist
          const newWaitlist = currentWaitlist.filter(
            (item) => item.id !== updatedRecord.id
          );
          useWaitlist.getState().setWaitlist(newWaitlist);

          // Add to bookings and sort
          const newBookings = [
            ...currentBookings,
            updatedRecord,
          ].sort(sortByCreationDate);
          useBookings.getState().setBookings(newBookings);
        }
        // Handle status change from booking to waitlist
        else if (
          previousStatus === QUEUE_STATUS.BOOKING &&
          newStatus === QUEUE_STATUS.WAITLIST
        ) {
          // Remove from bookings
          const newBookings = currentBookings.filter(
            (item) => item.id !== updatedRecord.id
          );
          useBookings.getState().setBookings(newBookings);

          // Add to waitlist and sort
          const newWaitlist = [
            ...currentWaitlist,
            updatedRecord,
          ].sort(sortByCreationDate);
          useWaitlist.getState().setWaitlist(newWaitlist);
        }
      } else {
        // Just update the item in its current list
        if (newStatus === QUEUE_STATUS.WAITLIST) {
          const currentWaitlist = useWaitlist.getState().waitlist;
          const newWaitlist = currentWaitlist.map((item) =>
            item.id === updatedRecord.id ? updatedRecord : item
          );
          useWaitlist.getState().setWaitlist(newWaitlist);
        } else if (newStatus === QUEUE_STATUS.BOOKING) {
          const currentBookings = useBookings.getState().bookings;
          const newBookings = currentBookings.map((item) =>
            item.id === updatedRecord.id ? updatedRecord : item
          );
          useBookings.getState().setBookings(newBookings);
        }
      }
    } catch (error) {
      console.error('Update handler failed:', error);
    }
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
