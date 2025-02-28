import { create } from 'zustand';
import pb from '../lib/pocketbase';
import { height } from '../components/Floating';

/**
 * Store for managing clinics data
 */
export const useClinicsStore = create((set) => ({
  clinics: pb.authStore.model?.expand.clinics,
  setClinics: (clinics) => set({ clinics }),
}));

/**
 * Store for managing doctors data
 */
export const useDoctorsStore = create((set) => ({
  doctors: pb.authStore.model?.expand.doctors,
  setDoctors: (doctors) => set({ doctors }),
}));

/**
 * Store for managing doctor selection values (for multi-select)
 */
export const useDoctorValue = create((set) => ({
  doctorValue: [pb.authStore.model?.expand.doctors?.[0]?.id].filter(
    Boolean
  ),
  setDoctorValues: (doctorValue) => set({ doctorValue }),
  resetDoctorValue: () =>
    set({
      doctorValue: [
        pb.authStore.model?.expand.doctors?.[0]?.id,
      ].filter(Boolean),
    }),
}));

/**
 * Store for managing clinic selection values (for multi-select)
 */
export const useClinicValue = create((set) => ({
  clinicValue: [pb.authStore.model?.expand.clinics?.[0]?.id].filter(
    Boolean
  ),
  setClinicValues: (clinicValue) => set({ clinicValue }),
  resetClinicValue: () =>
    set({
      clinicValue: [
        pb.authStore.model?.expand.clinics?.[0]?.id,
      ].filter(Boolean),
    }),
}));

/**
 * Store for managing selected doctor (single selection)
 */
export const useSelectedDoctor = create((set) => ({
  selectedDoctor: pb.authStore.model?.expand.doctors?.[0]?.id,
  setSelectedDoctor: (selectedDoctor) => set({ selectedDoctor }),
  resetSelectedDoctor: () =>
    set({
      selectedDoctor: pb.authStore.model?.expand.doctors?.[0]?.id,
    }),
}));

/**
 * Store for managing floating panel state and interactions
 */
export const useFloatingPanelState = create((set, get) => ({
  floatingRef: null,
  isFloatOpen: false,

  setIsFloatOpen: (isFloatOpen) => set({ isFloatOpen }),

  setFloatingRef: (ref) => set({ floatingRef: ref }),

  openFloat: () => {
    const { floatingRef } = get();
    if (floatingRef) {
      floatingRef.setHeight(height);
      set({ isFloatOpen: true });
    }
  },

  closeFloat: () => {
    const { floatingRef } = get();
    if (floatingRef) {
      floatingRef.setHeight(90);
      set({ isFloatOpen: false });
    }
  },

  toggleFloat: () => {
    const { isFloatOpen, openFloat, closeFloat } = get();
    isFloatOpen ? closeFloat() : openFloat();
  },
}));

/**
 * Store for managing current route information
 */
export const useCurrentRoute = create((set) => ({
  path: '/',
  fullPath: '',
  setPath: (newPath) => set({ path: newPath }),
  setFullPath: (newPath) => set({ fullPath: newPath }),
  resetPath: () => set({ path: '/', fullPath: '' }),
}));

/**
 * Store for managing idle status
 */
export const useIdleStatus = create((set) => ({
  idleStatus: false,
  setIdleStatus: (idleStatus) => set({ idleStatus }),
}));
