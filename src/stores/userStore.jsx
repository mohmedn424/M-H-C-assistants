import { create } from 'zustand';
import pb from '../lib/pocketbase';
import { height } from '../components/Floating';

export const useClinicsStore = create((set) => ({
  clinics: pb.authStore.model?.expand.clinics,
  setClinics: (clinics) => {
    set({ clinics });
  },
}));
export const useDoctorsStore = create((set) => ({
  doctors: pb.authStore.model?.expand.doctors,
  setDoctors: (doctors) => {
    set({ doctors });
  },
}));

export const useDoctorValue = create((set) => ({
  doctorValue: [pb.authStore.model?.expand.doctors[0].id],
  setDoctorValues: (doctorValue) => set({ doctorValue }),
}));

export const useClinicValue = create((set) => ({
  clinicValue: [pb.authStore.model?.expand.clinics[0].id],
  setClinicValues: (clinicValue) => set({ clinicValue }),
}));

export const useSelectedDoctor = create((set) => ({
  selectedDoctor: pb.authStore.model?.expand.doctors[0].id,
  setSelectedDoctor: (selectedDoctor) => {
    set({ selectedDoctor });
  },
}));

export const useFloatingPanelState = create((set) => ({
  floatingRef: null,
  isFloatOpen: false,
  setIsFloatOpen: (isFloatOpen) => set({ isFloatOpen }),
  setFloatingRef: (ref) => {
    set({ floatingRef: ref });
  },
  openFloat: () => {
    const floatingRef = useFloatingPanelState.getState().floatingRef;

    if (floatingRef) floatingRef.setHeight(height);
  },
  closeFloat: () => {
    const floatingRef = useFloatingPanelState.getState().floatingRef;
    if (floatingRef) floatingRef.setHeight(90);
  },
}));

export const useCurrentRoute = create((set) => ({
  path: '/',
  fullPath: '',
  setPath: (newPath) => set({ path: newPath }),
  setFullPath: (newPath) => set({ fullPath: newPath }),
}));

export const useIdleStatus = create((set) => ({
  idleStatus: false,
  setIdleStatus: (idleStatus) => set({ idleStatus }),
}));
