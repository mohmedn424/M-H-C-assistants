import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  useClinicsStore,
  useClinicValue,
  useDoctorsStore,
  useSelectedDoctor,
} from '../../../stores/userStore';
import pb from '../../../lib/pocketbase';
import {
  useFullQueue,
  fetchQueueLogic,
} from '../../../stores/queueStore';

// Custom hook with extreme performance optimizations
export function useQueuePage() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [showDoctorFilter, setShowDoctorFilter] = useState(false);

  // Store references to avoid unnecessary re-renders
  const { clinics } = useClinicsStore();
  const { clinicValue, setClinicValues } = useClinicValue();
  const { selectedDoctor, setSelectedDoctor } = useSelectedDoctor();
  const { updater } = useFullQueue();
  const { doctors } = useDoctorsStore();

  // Use refs for values that don't need to trigger re-renders
  const subscriptionRef = useRef(null);
  const clinicsRef = useRef(clinics);
  const doctorsRef = useRef(doctors);

  // Update refs when values change
  useEffect(() => {
    clinicsRef.current = clinics;
  }, [clinics]);

  useEffect(() => {
    doctorsRef.current = doctors;
  }, [doctors]);

  // Optimized subscription setup with cleanup
  const setupSubscription = useCallback(() => {
    fetchQueueLogic();

    // Cleanup previous subscription if exists
    if (subscriptionRef.current) {
      pb.collection('queue').unsubscribe(subscriptionRef.current);
    }

    // Subscribe to real-time updates with optimized callback
    subscriptionRef.current = pb
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
      if (subscriptionRef.current) {
        pb.collection('queue').unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  // Setup subscription once on mount with proper cleanup
  useEffect(() => {
    return setupSubscription();
  }, [setupSubscription]);

  // Optimized effect for queue updates
  useEffect(() => {
    updater();
  }, [clinicValue, selectedDoctor, updater]);

  // Highly optimized doctor change handler
  const handleDoctorChange = useCallback(
    (doctorId) => {
      if (doctorId !== selectedDoctor) {
        setSelectedDoctor(doctorId);
        updater();
      }
    },
    [setSelectedDoctor, updater, selectedDoctor]
  );

  // Memoize filtered doctors with optimized calculation
  const filteredDoctors = useMemo(() => {
    if (!clinicValue.length || !doctors?.length) {
      return doctors || [];
    }

    const selectedClinic = clinics?.find(
      (clinic) => clinic.id === clinicValue[0]
    );

    if (!selectedClinic?.doctors?.length) {
      return [];
    }

    // Create a Set for faster lookups
    const clinicDoctorsSet = new Set(selectedClinic.doctors);
    return doctors.filter((doctor) =>
      clinicDoctorsSet.has(doctor.id)
    );
  }, [doctors, clinicValue, clinics]);

  // Memoize selected doctor ID with minimal dependencies
  const selectedDoctorId = useMemo(
    () =>
      selectedDoctor ||
      pb.authStore.model?.expand?.doctors?.[0]?.id ||
      '',
    [selectedDoctor]
  );

  // Optimized refresh handler
  const handleRefresh = useCallback(() => {
    fetchQueueLogic();
  }, []);

  // Highly optimized filter change handler
  const handleFilterChange = useCallback(
    (val) => {
      if (val === 'all') {
        setClinicValues([]);
        setSelectedDoctor(''); // Reset doctor when selecting all clinics
      } else {
        setClinicValues([val]);

        // Use current refs to avoid dependency on clinics and doctors
        const currentClinics = clinicsRef.current;
        const currentDoctors = doctorsRef.current;

        const selectedClinic = currentClinics?.find(
          (clinic) => clinic.id === val
        );

        if (selectedClinic?.doctors?.length > 0) {
          // Use Set for faster lookups
          const clinicDoctorsSet = new Set(selectedClinic.doctors);
          const isCurrentDoctorValid =
            clinicDoctorsSet.has(selectedDoctor);

          if (!isCurrentDoctorValid) {
            // Find first valid doctor efficiently
            for (const doc of currentDoctors || []) {
              if (clinicDoctorsSet.has(doc.id)) {
                setSelectedDoctor(doc.id);
                break;
              }
            }
          }
        } else {
          setSelectedDoctor('');
        }
      }
      setShowFilter(false);
    },
    [
      setClinicValues,
      setShowFilter,
      selectedDoctor,
      setSelectedDoctor,
    ]
  );

  // Optimized doctor filter change handler
  const handleDoctorFilterChange = useCallback(
    (val) => {
      if (val !== selectedDoctor) {
        setSelectedDoctor(val);
      }
      setShowDoctorFilter(false);
    },
    [setSelectedDoctor, selectedDoctor]
  );

  // Memoize clinic name with minimal recalculation
  const clinicName = useMemo(() => {
    if (!clinicValue.length) return 'تصفية العيادات';

    const clinic = clinics?.find((c) => c.id === clinicValue[0]);
    return clinic?.name || 'تصفية العيادات';
  }, [clinicValue, clinics]);

  // Memoize doctor name with minimal recalculation
  const doctorName = useMemo(() => {
    if (!selectedDoctor) return 'تصفية الأطباء';

    const doctor = filteredDoctors.find(
      (d) => d.id === selectedDoctor
    );
    return doctor?.name_ar || 'تصفية الأطباء';
  }, [selectedDoctor, filteredDoctors]);

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
    showDoctorFilter,
    setShowDoctorFilter,
    selectedDoctor,
    setSelectedDoctor,
    handleFilterChange,
    handleDoctorFilterChange,
    handleRefresh,
    clinicName,
    doctorName,
  };
}

export default useQueuePage;
