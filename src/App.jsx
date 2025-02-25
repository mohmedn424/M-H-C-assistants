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
  const idle = useIdle(1000 * 60 * 3);
  const deleteHandler = useFullQueue((state) => state.deleteHandler);
  const createHandler = useFullQueue((state) => state.createHandler);
  const updateHandler = useFullQueue((state) => state.updateHandler);
  const setIdleStatus = useIdleStatus((state) => state.setIdleStatus);

  useEffect(() => {
    setIdleStatus(idle);
  }, [idle]);

  useEffect(() => {
    if (!pb.authStore.isValid) return;

    // Initial fetch
    fetchQueueLogic();

    // Set up subscription only if not idle
    if (!idle) {
      const unsubscribe = pb.collection('queue').subscribe(
        '*',
        async function (e) {
          switch (e.action) {
            case 'delete':
              try {
                await deleteHandler(e.record.id);
                deleteAudio.play();
                sendNotification(
                  `Item with ID ${e.record.id} has been deleted from the queue.`
                );
              } catch (error) {
                console.error('Failed to delete item:', error);
                // Optionally show error message to user
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
        queueFetchOptions
      );

      return () => {
        unsubscribe();
      };
    }
  }, [idle, pb.authStore.isValid]);

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
