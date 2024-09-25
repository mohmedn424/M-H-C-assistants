import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import {
  fetchQueueLogic,
  queueFetchOptions,
  useFullQueue,
} from './stores/queueStore';
import { useIdle } from '@uidotdev/usehooks';
import { useIdleStatus } from './stores/userStore';
import pb from './lib/pocketbase';
import { useEffect } from 'react';
import IdleOverly from './components/IdleOverly';

// Create a new router instance
const router = createRouter({ routeTree });

// Function to send browser notification
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
    // Request notification permission when the app initializes
    if (
      Notification.permission !== 'granted' &&
      Notification.permission !== 'denied'
    ) {
      Notification.requestPermission();
    }
  }, []);
  useEffect(() => {
    if (pb.authStore.isValid) {
      setIdleStatus(idle);
      if (!idle) {
        fetchQueueLogic();
        pb.collection('queue').subscribe(
          '*',
          function (e) {
            if (e.action === 'delete') {
              deleteHandler(e.record.id);
              sendNotification(
                `Item with ID ${e.record.id} has been deleted from the queue.`
              );
            }
            if (e.action === 'create') createHandler(e.record);
            if (e.action === 'update') updateHandler(e.record);
          },
          queueFetchOptions
        );
      } else {
        pb.collection('queue').unsubscribe();
      }
    }
    return () => {
      pb.collection('queue').unsubscribe();
    };
  }, [idle]);

  return (
    <>
      {pb.authStore.isValid && <IdleOverly />}
      <RouterProvider router={router} />
    </>
  );
}
