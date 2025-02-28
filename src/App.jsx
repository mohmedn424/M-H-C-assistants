import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import {
  fetchQueueLogic,
  queueFetchOptions,
  useFullQueue,
} from './stores/queueStore';
import pb from './lib/pocketbase';
import { useEffect, useCallback, useMemo } from 'react';
import deleteSound from './assets/notification.mp3';
import { Helmet } from 'react-helmet';
import ReloadPrompt from './components/ReloadPrompt';
import {
  useClinicValue,
  useDoctorValue,
  useSelectedDoctor,
} from './stores/userStore';

// Create audio instance outside component to prevent recreation on renders
const deleteAudio = new Audio(deleteSound);

// Create router instance outside component to prevent recreation
const router = createRouter({ routeTree });

// Notification helper function
const sendNotification = (message) => {
  if (Notification.permission === 'granted') {
    new Notification('Queue Update', { body: message });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('Queue Update', { body: message });
      }
    });
  }
};

export default function App() {
  const deleteHandler = useFullQueue((state) => state.deleteHandler);
  const createHandler = useFullQueue((state) => state.createHandler);
  const updateHandler = useFullQueue((state) => state.updateHandler);
  const { setClinicValues } = useClinicValue();
  const { setDoctorValues } = useDoctorValue();
  const { setSelectedDoctor } = useSelectedDoctor();

  // Memoize event handler to prevent recreation on each render
  const handleQueueEvent = useCallback(
    async (e) => {
      switch (e.action) {
        case 'delete':
          try {
            await deleteHandler(e.record.id);
            deleteAudio
              .play()
              .catch((err) =>
                console.warn('Audio play failed:', err)
              );
            sendNotification(
              `Item with ID ${e.record.id} has been deleted from the queue.`
            );
          } catch (error) {
            console.error('Failed to delete item:', error);
          }
          break;
        case 'create':
          createHandler(e.record);
          break;
        case 'update':
          updateHandler(e.record);
          break;
      }
    },
    [deleteHandler, createHandler, updateHandler]
  );

  // Memoize meta tag content
  const viewportContent = useMemo(
    () =>
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
    []
  );

  // Initialize app data on startup
  useEffect(() => {
    const initializeApp = async () => {
      if (pb.authStore.isValid) {
        // Set default clinic and doctor values from auth model
        if (pb.authStore.model?.expand?.clinics?.length > 0) {
          const defaultClinic =
            pb.authStore.model.expand.clinics[0].id;
          setClinicValues([defaultClinic]);
        }

        if (pb.authStore.model?.expand?.doctors?.length > 0) {
          const defaultDoctor =
            pb.authStore.model.expand.doctors[0].id;
          setDoctorValues([defaultDoctor]);
          setSelectedDoctor(defaultDoctor);
        }

        // Fetch queue data immediately on app start
        await fetchQueueLogic();
      }
    };

    initializeApp();
  }, [setClinicValues, setDoctorValues, setSelectedDoctor]);

  // Set up subscription to PocketBase changes
  useEffect(() => {
    if (!pb.authStore.isValid) return;

    // Set up subscription
    const unsubscribe = pb
      .collection('queue')
      .subscribe('*', handleQueueEvent, queueFetchOptions);

    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [handleQueueEvent]);

  return (
    <>
      <Helmet>
        <meta name="viewport" content={viewportContent} />
      </Helmet>
      <RouterProvider router={router} />
      <ReloadPrompt />
    </>
  );
}
