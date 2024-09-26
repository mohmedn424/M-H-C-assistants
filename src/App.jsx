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
import deleteSound from './assets/notification.mp3';
import { Helmet } from 'react-helmet';
const deleteAudio = new Audio(deleteSound);

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
  const idle = useIdle(1000 * 60 * 3); // 3 minutes
  const deleteHandler = useFullQueue((state) => state.deleteHandler);
  const createHandler = useFullQueue((state) => state.createHandler);
  const updateHandler = useFullQueue((state) => state.updateHandler);
  const setIdleStatus = useIdleStatus((state) => state.setIdleStatus);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setIdleStatus(idle);
      fetchQueueLogic();
      if (!idle) {
        pb.collection('queue').subscribe(
          '*',
          function (e) {
            if (e.action === 'delete') {
              deleteHandler(e.record.id);
              deleteAudio.play(); // Play the delete sound
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
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Helmet>
      {pb.authStore.isValid && <IdleOverly />}
      <RouterProvider router={router} />
    </>
  );
}
